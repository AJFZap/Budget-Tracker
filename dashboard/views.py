from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.paginator import Paginator
from django.http import JsonResponse
from preferences.models import UserPreferences
from expenses.models import Category, Expense
from income.models import Source, Income
from itertools import chain
from operator import attrgetter
import datetime
import json
import os

# Create your views here.

# @login_required(login_url='/authentication/login')
def index(request):
    if request.user.is_authenticated:
        # Get the prefered currency from the user.
        preferences = UserPreferences.objects.filter(user=request.user)[0] # Get the currency from the UserPreferences model.

        # Get the expenses and income from the user.
        expenses = Expense.objects.filter(user=request.user)
        income = Income.objects.filter(user=request.user)

        expenseAmount = get_expenses_amount(expenses)
        incomeAmount = get_income_amount(income)
        balance = float(incomeAmount) - expenseAmount

        # Fetch the latest 5 entries from each model
        latest_expenses = Expense.objects.all().order_by('-date')[:5]
        latest_incomes = Income.objects.all().order_by('-date')[:5]

        # Combine and sort by date
        latest_entries = sorted(
        chain(latest_expenses, latest_incomes),
        key=attrgetter('date'),
        reverse=True
        )

        # Get the 5 most recent combined entries
        latest_entries = latest_entries[:5]

        # Prepare context.
        context = {
            'Balance': balance,
            'Expenses': expenseAmount,
            'Income': incomeAmount,
            'latest_entries': latest_entries,
        }

        return render(request, 'dashboard.html', {'balances': context, 'preferences': preferences.currency[:3]})

    return render(request, 'dashboard.html')

def get_expenses_amount(expense):
    amount = 0
    
    for item in expense:
        amount += item.amount
    
    return amount

def get_income_amount(income):
    amount = 0
    
    for item in income:
        amount += item.amount
    
    return amount
