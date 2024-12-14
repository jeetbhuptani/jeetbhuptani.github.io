from django.db import models
from django.contrib.auth.models import User, AbstractUser, Group, Permission

# class Users(AbstractUser):
#     user_id = models.AutoField(primary_key=True)
#     city = models.CharField(max_length=100)

#     groups = models.ManyToManyField(Group, blank=True, related_name='custom_user_groups')
#     user_permissions = models.ManyToManyField(Permission, blank=True, related_name='custom_user_permissions')

class Cuisine(models.Model):
    cuisine_id = models.AutoField(primary_key=True)
    cuisine_name = models.CharField(max_length=100)

class Category(models.Model):
    category_id = models.AutoField(primary_key=True)
    category_name = models.CharField(max_length=100)

class Recipe(models.Model):
    recipe_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    recipe_name = models.CharField(max_length=100)
    recipe_image = models.ImageField(upload_to='static/recipe_images/')
    recipe_steps = models.TextField()
    ingredients = models.TextField()
    cooking_time = models.CharField(max_length=100)
    serving = models.IntegerField()
    cuisine = models.ForeignKey(Cuisine, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    rating = models.FloatField(default=0)
    count = models.IntegerField(default=0)
    veg = models.BooleanField()

class Report(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    report_id = models.AutoField(primary_key=True)
    report_name = models.CharField(max_length=100)


class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    comment = models.TextField()
    date = models.DateField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

class Userrating(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    rating = models.FloatField()