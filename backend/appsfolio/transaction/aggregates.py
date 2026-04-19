from django.db.models import Aggregate, DecimalField


class Median(Aggregate):
    """
    Agrégat PostgreSQL calculant la médiane via PERCENTILE_CONT(0.5).

    Utilisation :
        VenteParcelle.objects.aggregate(med=Median("valeur_fonciere"))

    Retourne None si l'ensemble est vide (comportement natif SQL).
    """

    function = "PERCENTILE_CONT"
    name = "median"
    output_field = DecimalField()
    # WITHIN GROUP est la syntaxe PostgreSQL pour les fonctions d'ensemble ordonné.
    # Elle n'est pas supportée par le ORM Django de base, d'où ce template custom.
    template = "%(function)s(0.5) WITHIN GROUP (ORDER BY %(expressions)s)"
    allow_distinct = False
