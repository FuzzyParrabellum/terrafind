from django.db import models

from appsfolio.place.models import Commune

import uuid

class VenteParcelle(models.Model):
    """
    Représente une transaction immobilière issue du jeu de données DVF
    (Demandes de Valeurs Foncières), produit par la DGFiP.

    Chaque instance correspond à la vente d'un bien ou d'une parcelle dans
    le Morbihan. Les données sont volontairement anonymisées : seule la commune
    est conservée, sans adresse ni numéro de voie, conformément aux exigences
    RGPD et aux conditions de réutilisation du dataset DVF qui interdisent
    l'indexation des données identifiantes.
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
    
    public_id = models.UUIDField(
        verbose_name="identifiant public pour les API",
        default=uuid.uuid4,
        editable=False,
        unique=True
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
    type_local = models.CharField(max_length=60, choices=TypeLocal.choices, blank=True)
    surface_reelle_bati = models.PositiveIntegerField(null=True, blank=True)
    nombre_pieces_principales = models.PositiveSmallIntegerField(null=True, blank=True)
    nature_culture = models.CharField(max_length=2, choices=NatureCulture.choices, blank=True)
    surface_terrain = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        ordering = ["-date_mutation"]
        indexes = [
            models.Index(fields=["commune"]),
            models.Index(fields=["date_mutation"]),
            models.Index(fields=["type_local"]),
        ]

    def __str__(self):
        return f"{self.type_local or 'Bien'} — {self.commune} — {self.valeur_fonciere} €"
