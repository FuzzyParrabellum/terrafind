from django.db import models
from django.contrib.postgres.fields import ArrayField

from appsfolio.place.models import Commune

import uuid


class VenteParcelle(models.Model):
    """
    Représente une transaction immobilière issue du jeu de données DVF
    (Demandes de Valeurs Foncières), produit par la DGFiP.

    Chaque instance correspond à une mutation (transaction) dans le Morbihan.
    Une mutation peut regrouper plusieurs biens (ex: maison + dépendance + terrain) :
    - `types_locaux` liste tous les types de biens de la transaction
    - `surface_bien_principal` est la surface du bien principal (Maison ou Appartement)
    - `surface_totale` est la somme des surfaces de tous les biens

    Les données identifiantes (adresse, numéro de voie) sont ignorées
    conformément aux exigences RGPD et aux conditions de réutilisation DVF qui
    interdisent l'indexation des données identifiantes.
    """

    class NatureMutation(models.TextChoices):
        VENTE = "Vente", "Vente"
        VENTE_EFFA = "Vente en l'état futur d'achèvement", "Vente en l'état futur d'achèvement"
        VENTE_TERRAIN = "Vente terrain à bâtir", "Vente terrain à bâtir"
        ECHANGE = "Echange", "Echange"
        EXPROPRIATION = "Expropriation", "Expropriation"
        ADJUDICATION = "Adjudication", "Adjudication"

    class TypeLocal(models.TextChoices):
        MAISON = "Maison", "Maison"
        APPARTEMENT = "Appartement", "Appartement"
        DEPENDANCE = "Dépendance", "Dépendance"
        LOCAL_INDUSTRIEL = "Local industriel. commercial ou assimilé", "Local industriel/commercial"

    class NatureCulture(models.TextChoices):
        TERRE = "T", "Terre"
        PRE = "P", "Pré"
        VERGER = "V", "Verger"
        BOIS = "B", "Bois"
        LANDE = "L", "Lande"
        JARDIN = "J", "Jardin"
        CARRIERE = "CA", "Carrière"
        ETANG = "E", "Étang"
        AUTRE = "A", "Autre"

    # Priorité pour déterminer le bien principal d'une mutation multi-biens
    PRIORITE_TYPE_LOCAL = [
        TypeLocal.MAISON,
        TypeLocal.APPARTEMENT,
        TypeLocal.LOCAL_INDUSTRIEL,
        TypeLocal.DEPENDANCE,
    ]

    public_id = models.UUIDField(
        verbose_name="identifiant public pour les API",
        default=uuid.uuid4,
        editable=False,
        unique=True,
    )
    commune = models.ForeignKey(
        Commune,
        on_delete=models.PROTECT,
        related_name="ventes",
    )
    code_postal = models.CharField(max_length=5)
    date_mutation = models.DateField()
    nature_mutation = models.CharField(max_length=60, choices=NatureMutation.choices)
    valeur_fonciere = models.DecimalField(max_digits=12, decimal_places=2)

    # Tous les types de biens impliqués dans la transaction (ex: ["Maison", "Dépendance"])
    types_locaux = ArrayField(
        models.CharField(max_length=60),
        default=list,
        blank=True,
    )

    # Nombre de pièces du bien principal uniquement
    nombre_pieces_principales = models.PositiveSmallIntegerField(null=True, blank=True)

    # Surface du bien principal (Maison ou Appartement), hors dépendances et terrain
    surface_bien_principal = models.PositiveIntegerField(null=True, blank=True)

    # Somme des surfaces de tous les biens bâtis de la transaction
    surface_totale = models.PositiveIntegerField(null=True, blank=True)

    nature_culture = models.CharField(max_length=2, choices=NatureCulture.choices, blank=True)
    surface_terrain = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        ordering = ["-date_mutation"]
        indexes = [
            models.Index(fields=["commune"]),
            models.Index(fields=["date_mutation"]),
        ]

    def __str__(self):
        type_principal = self.types_locaux[0] if self.types_locaux else "Bien"
        return f"{type_principal} — {self.commune} — {self.valeur_fonciere} €"
