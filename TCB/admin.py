from django.contrib import admin
from .models import Recipe, Report, Cuisine, Category, Comment, Userrating

class RecipeAdmin(admin.ModelAdmin):
    list_display = ('user','recipe_name','recipe_image','cooking_time','serving','rating','count','veg')
class ReportAdmin(admin.ModelAdmin):
    list_display = ('user','recipe','report_name')
class CommentAdmin(admin.ModelAdmin):
    list_display = ('user','recipe','comment','date')
admin.site.register(Recipe, RecipeAdmin)
admin.site.register(Report, ReportAdmin)
admin.site.register(Cuisine)
admin.site.register(Category)
admin.site.register(Comment, CommentAdmin)
admin.site.register(Userrating)