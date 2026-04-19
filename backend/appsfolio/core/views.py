from django.http import HttpResponse


def robots_txt(request):
    """
    Sert le fichier robots.txt à l'URL /robots.txt.

    Interdit aux crawlers d'indexer :
      - /api/*   : données DVF — obligation légale du jeu de données DGFiP
      - /admin/* : interface d'administration Django

    Autorise l'indexation de la racine (page d'accueil) pour le référencement.
    """
    lines = [
        "User-agent: *",
        "Disallow: /api/",
        "Disallow: /admin/",
        "",
        "Allow: /",
    ]
    content = "\n".join(lines)
    # content_type "text/plain" est le type MIME standard pour robots.txt.
    # Le charset utf-8 est explicite pour éviter toute ambiguïté.
    return HttpResponse(content, content_type="text/plain; charset=utf-8")
