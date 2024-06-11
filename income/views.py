from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.paginator import Paginator
from django.http import JsonResponse
from preferences.models import UserPreferences
from .models import Source, Income
import datetime
import json
import os

def income(request):
    if request.user.is_authenticated:
        income = Income.objects.filter(user=request.user)
        paginator = Paginator(income, 5)

        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)

        preferences = UserPreferences.objects.filter(user=request.user)[0] # Get the currency from the UserPreferences model.
        preferences = preferences.currency[:3]

        return render(request, 'income/index.html', {'page_obj': page_obj, 'preferences': preferences}) # Send the prefered currency from preferences also

    return render(request, 'income/index.html')

def add_income(request):
    
    # Grabs each on of the categories in the Category model.
    sources = Source.objects.all()

    if request.method == 'GET':

        return render(request, 'income/add_income.html', {'sources': sources})
    
    elif request.method == 'POST':
        
        # If no description is provided we just do a default.
        descriptionValue = "No description provided."

        # In case the user uses spaces in the description we still don't count them as a description.
        if request.POST['description'].strip():
            descriptionValue = request.POST['description']

        # WHEN A USER IS AUTHENTICATED.
        if request.user.is_authenticated:

            newIncomeList = Income.objects.create(
                user = request.user,
                name = request.POST['incomeName'],
                date = request.POST['datePicked'],
                description = descriptionValue,
                amount = request.POST['amount'],
                source = request.POST['source'],
            )
            newIncomeList.save()

            messages.success(request, "Income Added to your list!")
            return redirect('income')
        
        # WHEN IT IS A GUEST WE DON'T SAVE A SINGLE THING.
        else:
            income = {'name': request.POST['incomeName'],
                'date': request.POST['datePicked'],
                'description': descriptionValue,
                'amount': request.POST['amount'],
                'source': request.POST['source'],
            }

            messages.success(request, "Income Added to your list!")
            return redirect('income')

def delete_income(request,pk):
    """
    Given an ID it deletes that item from the database.
    """
    if request.method == 'POST':
        income = Income.objects.get(id=pk)
        income.delete()
        messages.success(request, "Income deleted successfully!")
        return JsonResponse({'success': True})
    
    return JsonResponse({'success': False})

def edit_income(request, pk):
    # Grabs each on of the sources in the Source model.
    sources = Source.objects.all()
    income = Income.objects.get(id=pk)

    if request.user == income.user:
        if request.method == 'GET':

            return render(request, 'income/edit_income.html', {'sources': sources, 'income': income})
        
        elif request.method == 'POST':
            
            # If no description is provided we just do a default.
            descriptionValue = "No description provided."

            # In case the user uses spaces in the description we still don't count them as a description.
            if request.POST['description'].strip():
                descriptionValue = request.POST['description']

            # WHEN A USER IS AUTHENTICATED.
            if request.user.is_authenticated:

                editedIncome = Income.objects.get(id=pk)
                
                editedIncome.name = request.POST['incomeName']
                editedIncome.date = request.POST['datePicked']
                editedIncome.description = descriptionValue
                editedIncome.amount = request.POST['amount']
                editedIncome.source = request.POST['source']

                editedIncome.save()
                
            messages.success(request, "Income edited successfully!")
            return redirect('income')
    else:
        messages.error(request, "Naugthy Naugthy. You don't have permissions to see that.")
        return redirect('income')
    
def search_income(request):

    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        search_str = data.get('searchText', '')

        income = Income.objects.filter(
            amount__startswith=search_str, user=request.user) | Income.objects.filter(
                date__startswith=search_str, user=request.user) | Income.objects.filter(
                    description__icontains=search_str, user=request.user) | Income.objects.filter(
                        name__icontains=search_str, user=request.user) | Income.objects.filter(
                            source__istartswith=search_str, user=request.user)
        
        preferences = UserPreferences.objects.filter(user=request.user)[0] # Get the currency from the UserPreferences model.
        
        data = list(income.values())
        if data:
            data[0]['currency'] = preferences.currency[:3]
        
        return JsonResponse(list(data), safe=False)
    
    return JsonResponse({'error': 'Invalid request method'}, status=400)

def get_source(income):
    return income.source

def get_source_amount(source, income):
    amount = 0
    bySource = income.filter(source=source)

    for item in bySource:
        amount += item.amount

    return amount

def income_data(request):
    
    if request.method == 'GET':
        # today = datetime.date.today()
        # lastMonth = today.datetime.timedelta(days = 30)
        # last6months = today.datetime.timedelta(days = 30*6)
        # lastyear = today.datetime.timedelta(days = 30*12)
        if request.user.is_authenticated:
            income = Income.objects.filter(user=request.user)

            if income:
                finalRepresentation = {}

                sourceList = list(set(map(get_source, income)))

                for x in income:
                    for y in sourceList:
                        finalRepresentation[y] = get_source_amount(y, income)

                return JsonResponse({'income_data': finalRepresentation}, safe=False)
            else:
                return JsonResponse({'error': None}, status=404)
        
        return JsonResponse({'error': None}, status=404)

def income_summary(request):
    if request.method == 'GET':
        return render(request, 'income/income_summary.html')
    
    return render(request, 'income/income_summary.html')