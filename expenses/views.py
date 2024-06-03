from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.paginator import Paginator
from django.http import JsonResponse
from .models import Category, Expense
import json
import os

# Create your views here.

# @login_required(login_url='/authentication/login')
def index(request):
    if request.user.is_authenticated:
        expenses = Expense.objects.filter(user=request.user)
        paginator = Paginator(expenses, 5)

        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)

        return render(request, 'expenses/index.html', {'page_obj': page_obj})

    return render(request, 'expenses/index.html')

def add_expense(request):
    
    # Grabs each on of the categories in the Category model.
    categories = Category.objects.all()

    if request.method == 'GET':

        return render(request, 'expenses/add_expense.html', {'categories': categories})
    
    elif request.method == 'POST':
        
        # If no description is provided we just do a default.
        descriptionValue = "No description provided."

        # In case the user uses spaces in the description we still don't count them as a description.
        if request.POST['description'].strip():
            descriptionValue = request.POST['description']

        # WHEN A USER IS AUTHENTICATED.
        if request.user.is_authenticated:

            newExpensesList = Expense.objects.create(
                user = request.user,
                name = request.POST['expenseName'],
                date = request.POST['datePicked'],
                description = descriptionValue,
                amount = request.POST['amount'],
                category = request.POST['category'],
            )
            newExpensesList.save()

            messages.success(request, "Expense Added to your list!")
            return redirect('expenses')
        
        # WHEN IT IS A GUEST WE DON'T SAVE A SINGLE THING.
        else:
            expenses = {'name': request.POST['expenseName'],
                'date': request.POST['datePicked'],
                'description': descriptionValue,
                'amount': request.POST['amount'],
                'category': request.POST['category'],
            }

            messages.success(request, "Expense Added to your list!")
            return redirect('expenses')

def delete_expense(request,pk):
    """
    Given an ID it deletes that item from the database.
    """
    if request.method == 'POST':
        expense = Expense.objects.get(id=pk)
        expense.delete()
        messages.success(request, "Expense deleted successfully!")
        return JsonResponse({'success': True})
    
    return JsonResponse({'success': False})

def edit_expense(request, pk):
    # Grabs each on of the categories in the Category model.
    categories = Category.objects.all()
    expense = Expense.objects.get(id=pk)

    if request.user == expense.user:
        if request.method == 'GET':

            return render(request, 'expenses/edit_expense.html', {'categories': categories, 'expenses': expense})
        
        elif request.method == 'POST':
            
            # If no description is provided we just do a default.
            descriptionValue = "No description provided."

            # In case the user uses spaces in the description we still don't count them as a description.
            if request.POST['description'].strip():
                descriptionValue = request.POST['description']

            # WHEN A USER IS AUTHENTICATED.
            if request.user.is_authenticated:

                editedExpense = Expense.objects.get(id=pk)
                    
                editedExpense.name = request.POST['expenseName']
                editedExpense.date = request.POST['datePicked']
                editedExpense.description = descriptionValue
                editedExpense.amount = request.POST['amount']
                editedExpense.category = request.POST['category']

                editedExpense.save()
                
            messages.success(request, "Expense edited successfully!")
            return redirect('expenses')
    else:
        messages.error(request, "Naugthy Naugthy. You don't have permissions to see that.")
        return redirect('expenses')
    
def search_expense(request):

    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        search_str = data.get('searchText', '')

        expenses = Expense.objects.filter(
            amount__startswith=search_str, user=request.user) | Expense.objects.filter(
                date__startswith=search_str, user=request.user) | Expense.objects.filter(
                    description__icontains=search_str, user=request.user) | Expense.objects.filter(
                        name__icontains=search_str, user=request.user) | Expense.objects.filter(
                            category__startswith=search_str, user=request.user)
        
        data = expenses.values()
        
        return JsonResponse(list(data), safe=False)
    
    return JsonResponse({'error': 'Invalid request method'}, status=400)