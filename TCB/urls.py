from django.urls import path
from . import views

urlpatterns = [
    path('',views.home,name="home"),
    path('login',views.login,name="login"),
    path('signup',views.signup,name="signup"),
    path('logout',views.logout,name="logout"),
    path('aboutus',views.aboutus,name="aboutus"),
    path('account',views.account,name="account"),
    path('urecipe',views.urecipe,name="urecipe"),
    path('vrecipe/<int:recipe_id>/',views.vrecipe,name="vrecipe"),
    path('vrecipe/<int:recipe_id>/comment',views.comment,name="comment"),
    path('report',views.report,name="report"),
    path('delete/<int:recipe_id>/',views.delete,name="delete"),
]