"""
Commande Django : import_dvf
Usage : manage.py import_dvf <fichier.txt> [<fichier2.txt> ...]

Importe les données DVF (Demandes de Valeurs Foncières) depuis un ou plusieurs
fichiers CSV fournis par la DGFiP (séparateur |, encodage UTF-8).

Seules les lignes du département 56 (Morbihan) sont importées.
DuckDB est utilisé pour pré-filtrer le fichier brut (toute la France) avant
que Python ne le parcoure — cela réduit le volume traité de ~500 Mo à ~10 Mo.

Le DVF génère une ligne par bien pour chaque mutation (transaction). Une mutation
peut donc avoir plusieurs lignes (ex: maison + dépendance + terrain). La commande
groupe ces lignes par mutation et produit une seule VenteParcelle par transaction,
avec :
  - types_locaux        : liste de tous les types de biens de la transaction
  - surface_bien_principal : surface du bien principal (Maison > Appartement > ...)
  - surface_totale      : somme des surfaces de tous les biens bâtis

Les données identifiantes (adresse, numéro de voie) sont ignorées
conformément aux exigences RGPD et aux conditions de réutilisation DVF.

Idempotente : relancer la commande sur le même fichier ne crée pas de doublons
grâce à get_or_create sur les communes et bulk_create(ignore_conflicts=True).
"""

import csv
import io
from collections import defaultdict
from datetime import datetime
from decimal import Decimal, InvalidOperation
from pathlib import Path

import duckdb
from django.core.management.base import BaseCommand, CommandError

from appsfolio.place.models import Commune
from appsfolio.transaction.models import VenteParcelle

CODE_DEPARTEMENT_CIBLE = "56"
BATCH_SIZE = 500


def _parse_date(valeur: str):
    """Convertit une date DVF (JJ/MM/AAAA) en objet date Python, ou None."""
    if not valeur:
        return None
    try:
        return datetime.strptime(valeur.strip(), "%d/%m/%Y").date()
    except ValueError:
        return None


def _parse_decimal(valeur: str):
    """
    Convertit un prix DVF ('387000,00') en Decimal Python, ou None.
    Le DVF utilise la virgule comme séparateur décimal (convention française).
    """
    if not valeur:
        return None
    try:
        return Decimal(valeur.strip().replace(",", "."))
    except InvalidOperation:
        return None


def _parse_int(valeur: str):
    """Convertit une chaîne en entier, ou None si vide ou invalide."""
    if not valeur:
        return None
    try:
        return int(valeur.strip())
    except ValueError:
        return None


def _normalise_nature_culture(valeur: str) -> str:
    """
    Retourne la valeur si elle correspond à un choix valide du modèle,
    sinon retourne une chaîne vide (champ optionnel).
    """
    valeur = valeur.strip() if valeur else ""
    valides = {choix[0] for choix in VenteParcelle.NatureCulture.choices}
    return valeur if valeur in valides else ""


def _filtrer_morbihan(fichier: Path) -> io.StringIO:
    """
    Utilise DuckDB pour lire le fichier DVF complet (toute la France) et
    n'extraire que les lignes du Morbihan (Code departement = '56').

    all_varchar=true est indispensable : sans ça, DuckDB convertit les dates
    et les prix en types natifs, ce qui casse nos fonctions de parsing qui
    attendent les formats bruts DVF (JJ/MM/AAAA et virgule décimale).
    """
    conn = duckdb.connect()
    resultat = conn.execute(f"""
        SELECT *
        FROM read_csv(
            '{fichier}',
            delim='|',
            header=true,
            all_varchar=true,
            ignore_errors=true
        )
        WHERE "Code departement" = '{CODE_DEPARTEMENT_CIBLE}'
    """).fetchdf()
    conn.close()

    buffer = io.StringIO()
    resultat.to_csv(buffer, index=False, sep="|")
    buffer.seek(0)
    return buffer


def _cle_mutation(ligne: dict) -> tuple:
    """
    Construit une clé unique identifiant une mutation dans le DVF.
    Deux lignes avec la même clé appartiennent à la même transaction.
    """
    return (
        ligne.get("No disposition", "").strip(),
        ligne.get("Date mutation", "").strip(),
        ligne.get("Valeur fonciere", "").strip(),
        ligne.get("Code departement", "").strip(),
        ligne.get("Code commune", "").strip(),
    )


def _bien_principal(biens: list[dict]) -> dict:
    """
    Parmi toutes les lignes d'une mutation, retourne celle du bien principal
    selon l'ordre de priorité : Maison > Appartement > Local industriel > Dépendance.
    Si aucun bien bâti, retourne la première ligne (terrain pur).
    """
    priorite = list(VenteParcelle.PRIORITE_TYPE_LOCAL)
    for type_prioritaire in priorite:
        for bien in biens:
            if bien.get("Type local", "").strip() == type_prioritaire:
                return bien
    return biens[0]


class Command(BaseCommand):
    help = (
        "Importe les transactions DVF du Morbihan depuis un ou plusieurs "
        "fichiers CSV de la DGFiP (séparateur |)."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "fichiers",
            nargs="+",
            type=str,
            help="Chemin(s) vers le(s) fichier(s) DVF à importer (.txt ou .csv).",
        )

    def handle(self, *args, **options):
        for chemin in options["fichiers"]:
            fichier = Path(chemin)

            if not fichier.exists():
                raise CommandError(f"Fichier introuvable : {fichier}")

            self.stdout.write(f"Lecture de {fichier.name}…")
            self.stdout.write("  Filtrage Morbihan via DuckDB…")
            buffer = _filtrer_morbihan(fichier)

            self.stdout.write("  Groupement des mutations…")
            mutations = self._grouper_mutations(buffer)

            self.stdout.write(f"  {len(mutations)} mutations trouvées. Import en base…")
            self._importer_mutations(mutations)

        self.stdout.write(self.style.SUCCESS("Import terminé."))

    def _grouper_mutations(self, buffer: io.StringIO) -> dict[tuple, list[dict]]:
        """
        Lit le buffer CSV et regroupe les lignes par mutation.
        Retourne un dict : clé_mutation → liste de lignes (biens).
        """
        mutations: dict[tuple, list[dict]] = defaultdict(list)
        lecteur = csv.DictReader(buffer, delimiter="|")

        for ligne in lecteur:
            # Ignorer les natures de mutation non reconnues
            nature = ligne.get("Nature mutation", "").strip()
            valeurs_valides = {choix[0] for choix in VenteParcelle.NatureMutation.choices}
            if nature not in valeurs_valides:
                continue

            # Ignorer si date ou prix manquant
            if not ligne.get("Date mutation", "").strip():
                continue
            if not ligne.get("Valeur fonciere", "").strip():
                continue

            mutations[_cle_mutation(ligne)].append(ligne)

        return mutations

    def _importer_mutations(self, mutations: dict[tuple, list[dict]]):
        """Convertit les mutations groupées en VenteParcelle et les insère en base."""

        nb_importees = nb_ignorees = 0
        nb_date_invalide = nb_valeur_invalide = 0
        cache_communes: dict[str, Commune] = {}
        lot: list[VenteParcelle] = []

        # Log de diagnostic sur les 3 premières mutations pour vérifier les formats
        for i, biens in enumerate(list(mutations.values())[:3]):
            ref = biens[0]
            self.stdout.write(
                f"  [diagnostic] mutation {i+1} — "
                f"date brute: '{ref.get('Date mutation', '')}' | "
                f"valeur brute: '{ref.get('Valeur fonciere', '')}'"
            )

        for biens in mutations.values():
            ref = biens[0]

            date = _parse_date(ref.get("Date mutation", ""))
            valeur = _parse_decimal(ref.get("Valeur fonciere", ""))

            if date is None:
                nb_date_invalide += 1
                nb_ignorees += 1
                continue
            if valeur is None:
                nb_valeur_invalide += 1
                nb_ignorees += 1
                continue

            # Commune
            code_dep = ref.get("Code departement", "").strip()
            code_com = ref.get("Code commune", "").strip().zfill(3)
            code_insee = f"{code_dep}{code_com}"
            nom_commune = ref.get("Commune", "").strip().title()

            if code_insee not in cache_communes:
                commune, _ = Commune.objects.get_or_create(
                    code_insee=code_insee,
                    defaults={
                        "nom": nom_commune,
                        "code_departement": code_dep,
                        "code_commune": code_com,
                    },
                )
                cache_communes[code_insee] = commune

            commune = cache_communes[code_insee]

            # Collecter tous les types de biens distincts de la mutation
            types_locaux = list({
                b.get("Type local", "").strip()
                for b in biens
                if b.get("Type local", "").strip()
            })

            # Surface totale = somme de toutes les surfaces bâties de la mutation
            surface_totale = sum(
                s for b in biens
                if (s := _parse_int(b.get("Surface reelle bati", ""))) is not None
            ) or None

            # Bien principal selon l'ordre de priorité
            principal = _bien_principal(biens)
            surface_bien_principal = _parse_int(principal.get("Surface reelle bati", ""))
            nombre_pieces = _parse_int(principal.get("Nombre pieces principales", ""))

            # Terrain : on prend la valeur maximale parmi les lignes (évite les doublons de surface)
            surface_terrain = max(
                (s for b in biens if (s := _parse_int(b.get("Surface terrain", ""))) is not None),
                default=None,
            )
            nature_culture = _normalise_nature_culture(ref.get("Nature culture", ""))

            lot.append(VenteParcelle(
                commune=commune,
                code_postal=ref.get("Code postal", "").strip(),
                date_mutation=date,
                nature_mutation=ref.get("Nature mutation", "").strip(),
                valeur_fonciere=valeur,
                types_locaux=types_locaux,
                nombre_pieces_principales=nombre_pieces,
                surface_bien_principal=surface_bien_principal,
                surface_totale=surface_totale,
                nature_culture=nature_culture,
                surface_terrain=surface_terrain,
            ))
            nb_importees += 1

            if len(lot) >= BATCH_SIZE:
                VenteParcelle.objects.bulk_create(lot, ignore_conflicts=True)
                lot = []

        if lot:
            VenteParcelle.objects.bulk_create(lot, ignore_conflicts=True)

        self.stdout.write(
            f"  {nb_importees} mutations importées — "
            f"{nb_ignorees} ignorées "
            f"(dont {nb_date_invalide} date invalide, {nb_valeur_invalide} valeur invalide)"
        )
