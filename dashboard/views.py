from django.shortcuts import render, redirect
from django.contrib import messages
from django.core.paginator import Paginator
from django.template.loader import render_to_string
from django.http import JsonResponse, HttpResponse
from preferences.models import UserPreferences
from expenses.models import Category, Expense
from income.models import Source, Income
from .forms import UploadFileForm
from itertools import chain
from weasyprint import HTML
from operator import attrgetter
import datetime, json, os, csv, xlwt, tempfile
import pandas as pd

# Create your views here.

def index(request):
    if request.user.is_authenticated:
        # Get the prefered currency from the user and if it's new and doesn't have any we create the database with the defaults.
        if UserPreferences.objects.filter(user=request.user).exists():
            preferences = UserPreferences.objects.filter(user=request.user)[0] # Get the currency from the UserPreferences model.
            
        else:
            UserPreferences.objects.create(user=request.user)
            preferences = UserPreferences.objects.filter(user=request.user)[0] # Get the currency from the UserPreferences model.

        preferences = preferences.currency[:3]

        # Get the expenses and income from the user.
        expenses = Expense.objects.filter(user=request.user)
        income = Income.objects.filter(user=request.user)

        expenseAmount = get_expenses_amount(expenses)
        incomeAmount = get_income_amount(income)
        balance = float(incomeAmount) - expenseAmount

        # Fetch the latest 5 entries from each model
        latest_expenses = Expense.objects.filter(user=request.user).order_by('-date')[:5]
        latest_incomes = Income.objects.filter(user=request.user).order_by('-date')[:5]

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
            'Balance': format(balance, ".2f"),
            'Expenses': format(expenseAmount, ".2f"),
            'Income': incomeAmount,
            'latest_entries': latest_entries,
        }

        return render(request, 'dashboard/dashboard.html', {'balances': context, 'preferences': preferences})

    return render(request, 'dashboard/dashboard.html')

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

def export_data(request):
    if request.user.is_authenticated:
        expenses = Expense.objects.filter(user=request.user).exists()
        income = Income.objects.filter(user=request.user).exists()
        fileType = request.POST.get('filetype')
        
        # Checks if the user has both tables and if he doesn't it acts accordingly.
        if expenses and income:

            # Fetch all the entries from each model.
            expenses = Expense.objects.filter(user=request.user).order_by('-date')
            incomes = Income.objects.filter(user=request.user).order_by('-date')

            # Combine and sort by date.
            entries = sorted(
            chain(expenses, incomes),
            key=attrgetter('date'),
            reverse=True
            )
            total = float(get_income_amount(incomes)) + get_expenses_amount(expenses)
        
        elif expenses:
            entries = Expense.objects.filter(user=request.user)

        elif income:
            entries = Income.objects.filter(user=request.user)

        match fileType:
            case 'csv':
                response = HttpResponse(content_type='text/csv')
                response['Content-Disposition'] = f'attachment; filename = BudgetTracker-{str(datetime.datetime.now().date())}.csv'

                writer = csv.writer(response)
                writer.writerow(['Name', 'Source/Category', 'Date', 'Description', 'Type', 'Amount'])

                for entry in entries:
                    if entry.entry_type == 'Expense':
                        writer.writerow([entry.name, entry.category, entry.date, entry.description, entry.entry_type, entry.amount])
                    else:
                        writer.writerow([entry.name, entry.source, entry.date, entry.description, entry.entry_type, entry.amount])
                
                return response
            
            case 'excel':
                response = HttpResponse(content_type='text/ms-excel')
                response['Content-Disposition'] = f'attachment; filename = BudgetTracker-{str(datetime.datetime.now().date())}.xlsx'

                wb = xlwt.Workbook(encoding='utf-8')
                ws = wb.add_sheet('BudgetTracker')

                row_num = 0

                font_style = xlwt.XFStyle()
                font_style.font.bold = True

                columns = ['Name', 'Source/Category', 'Date', 'Description', 'Type', 'Amount']

                for col_num in range(len(columns)):
                    ws.write(row_num, col_num, columns[col_num], font_style)

                font_style = xlwt.XFStyle()

                # Holds all the needed data entries for exportation.
                data = []
                
                for entry in entries:
                    if entry.entry_type == 'Expense':
                        data.append([entry.name, entry.category, entry.date, entry.description, entry.entry_type, entry.amount])
                    else:
                        data.append([entry.name, entry.source, entry.date, entry.description, entry.entry_type, entry.amount])
                
                for row in data:
                    row_num += 1

                    for col_num in range(len(row)):
                        # print(f'Row_num: {row_num}, Col_Num: {col_num}, Content: {row[col_num]}')
                        ws.write(row_num, col_num, str(row[col_num]), font_style)
                
                wb.save(response)

                return response

            
            case 'pdf':
                response = HttpResponse(content_type='text/pdf')
                response['Content-Disposition'] = f'attachment; filename = BudgetTracker-{str(datetime.datetime.now().date())}.pdf'
                response['Content-Transfer-Encoding'] = 'binary'

                html_string = render_to_string('dashboard/pdf-output.html', {'entries': entries, 'total': total})
                html = HTML(string=html_string)

                result = html.write_pdf()

                with tempfile.NamedTemporaryFile(delete=True) as product:
                    product.write(result)
                    product.flush()

                    product= open(product.name, 'rb')
                    response.write(product.read())

                return response

        return HttpResponse("Export format not supported")
    
    else:
        data = json.loads(request.body)
        entries = data.get('allEntries', [])
        fileType = data.get('format')
        # print(entries)

        match fileType:
            case 'csv':
                response = HttpResponse(content_type='text/csv')
                response['Content-Disposition'] = f'attachment; filename = BudgetTracker-{str(datetime.datetime.now().date())}.csv'

                writer = csv.writer(response)
                writer.writerow(['Name', 'Source/Category', 'Date', 'Description', 'Type', 'Amount'])

                for entry in entries:
                    writer.writerow([entry['name'], entry['source'], entry['date'], entry['description'], entry['db_type'], entry['amount']])

                return response
            
            case 'xlsx':
                response = HttpResponse(content_type='text/ms-excel')
                response['Content-Disposition'] = f'attachment; filename = BudgetTracker-{str(datetime.datetime.now().date())}.xlsx'

                wb = xlwt.Workbook(encoding='utf-8')
                ws = wb.add_sheet('BudgetTracker')

                row_num = 0

                font_style = xlwt.XFStyle()
                font_style.font.bold = True

                columns = ['Name', 'Source/Category', 'Date', 'Description', 'Type', 'Amount']

                for col_num in range(len(columns)):
                    ws.write(row_num, col_num, columns[col_num], font_style)

                font_style = xlwt.XFStyle()

                # Write data rows
                for entry in entries:
                    row_num += 1
                    ws.write(row_num, 0, entry['name'])
                    ws.write(row_num, 1, entry['source'])
                    ws.write(row_num, 2, entry['date'])
                    ws.write(row_num, 3, entry['description'])
                    ws.write(row_num, 4, entry['db_type'])
                    ws.write(row_num, 5, entry['amount'])
                
                wb.save(response)
                return response

            
            case 'pdf':
                response = HttpResponse(content_type='text/pdf')
                response['Content-Disposition'] = f'attachment; filename = BudgetTracker-{str(datetime.datetime.now().date())}.pdf'
                response['Content-Transfer-Encoding'] = 'binary'

                entries = data.get('allEntries')

                totalAmount = 0.00
                
                for entry in entries:
                    if entry['db_type'] == 'Expense':
                        totalAmount -= float(entry['amount'])
                    else:
                        totalAmount += float(entry['amount'])
                

                html_string = render_to_string('dashboard/pdf-output.html', {'entries': entries, 'total': totalAmount})
                html = HTML(string=html_string)

                result = html.write_pdf()

                with tempfile.NamedTemporaryFile(delete=True) as product:
                    product.write(result)
                    product.flush()

                    product= open(product.name, 'rb')
                    response.write(product.read())

                return response
        
    return HttpResponse("Export format not supported")

def import_data(request):

    if request.method == 'POST':
        if request.user.is_authenticated:
            file = request.FILES.get('file')
            delete_previous = request.POST.get('delete_previous') == 'true'
            # print(delete_previous)

            if not file:
                return JsonResponse({'error': 'No file provided'}, status=400)

            file_type = file.name.split('.')[-1].lower()

            try:
                if file_type == 'csv':
                    df = pd.read_csv(file)
                elif file_type in ['xls', 'xlsx']:
                    df = pd.read_excel(file)
                else:
                    messages.error(request, 'Unsupported file format')
                    return JsonResponse({'error': f'Unsupported file format'})
                
                # Check that the file has all the needed columns.
                required_columns = ['Name', 'Source/Category', 'Amount', 'Date', 'Type', 'Description']
                if not all(column in df.columns for column in required_columns):
                    messages.error(request, 'Wrong amount of columns or names.')
                    return JsonResponse({'error': 'Wrong amount of columns or names.'}, status=400)
                
                # Clear existing records if the user requested it.
                if delete_previous == True:
                    Expense.objects.filter(user=request.user).delete()
                    Income.objects.filter(user=request.user).delete()

                # print(df)

                for index, row in df.iterrows():
                    # print(row)
                    if row['Type'] == 'Expense':
                        Expense.objects.create(
                            user=request.user,
                            name=row['Name'],
                            category=row['Source/Category'],
                            amount=row['Amount'],
                            description=row['Description'],
                            date=row['Date'],
                        )
                    else:
                        Income.objects.create(
                            user=request.user,
                            name=row['Name'],
                            source=row['Source/Category'],
                            amount=row['Amount'],
                            description=row['Description'],
                            date=row['Date'],
                        )

                messages.success(request, 'Data imported successfully')
                return JsonResponse({'success': True})

            except Exception as e:
                messages.error(request, f'Error processing file: {e}')
                return JsonResponse({'error': f'Error pocessing file: {e}'}, status=400)
    else:
        form = UploadFileForm()
