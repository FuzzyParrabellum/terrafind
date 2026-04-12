from django.db import models
from django.conf import settings
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractUser

import uuid


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError('Un utilisateur nécessite un email pour être crée')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)
    
    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser doit avoir is_staff a True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser doit avoir is_superuser a True')
        
        return self._create_user(email, password, **extra_fields)

class User(AbstractUser):

    username = None
    email = models.EmailField(
        verbose_name="Adresse mail",
        max_length=255,
        unique=True)
    
    public_id = models.UUIDField(
        verbose_name="identifiant public pour les API",
        default=uuid.uuid4,
        editable=False
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    #  personal add
    objects = UserManager()
