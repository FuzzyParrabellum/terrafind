from django.db import models


class Commune(models.Model):
    """
    Représente une commune du Morbihan (département 56).

    Le code INSEE est calculé automatiquement à partir de code_departement
    et code_commune lors de chaque sauvegarde — il ne doit pas être renseigné
    manuellement. C'est l'identifiant officiel et unique d'une commune en France,
    plus fiable que le code postal (un code postal peut couvrir plusieurs communes
    et une commune peut avoir plusieurs codes postaux).
    """
    code_insee = models.CharField(max_length=5, unique=True)
    nom = models.CharField(max_length=255)
    code_departement = models.CharField(max_length=3)
    code_commune = models.CharField(max_length=3)

    class Meta:
        ordering = ["nom"]

    # Override save to ensure code_insee is always the 
    # combination of code_departement and code_commune
    # warning code_departement can be 2A or 2B for Corsica, 
    # so we can't just concatenate code_departement and code_commune 
    # without checking if later use another departement aside from morbihan
    def save(self, *args, **kwargs):
        self.code_insee = f"{self.code_departement}{self.code_commune}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nom} ({self.code_insee})"
