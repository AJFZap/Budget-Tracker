from django.shortcuts import render, redirect
from django.contrib import messages
from django.core.paginator import Paginator
from django.template.loader import render_to_string
from django.http import JsonResponse, HttpResponse
from django.utils.translation import gettext as _
from django.utils import translation
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
            total = float(get_income_amount(incomes)) - get_expenses_amount(expenses)
        
        elif expenses:
            entries = Expense.objects.filter(user=request.user)
            total = get_expenses_amount(expenses)

        elif income:
            entries = Income.objects.filter(user=request.user)
            total = float(get_income_amount(incomes))

        match fileType:
            case 'csv':
                response = HttpResponse(content_type='text/csv')
                response['Content-Disposition'] = f'attachment; filename = BudgetTracker-{str(datetime.datetime.now().date())}.csv'

                writer = csv.writer(response)
                writer.writerow([_('Name'), _('Source/Category'), _('Date'), _('Description'), _('Type'), _('Amount')])

                for entry in entries:
                    if entry.entry_type == _('Expense'):
                        writer.writerow([entry.name, entry.category, entry.date, entry.description, entry.entry_type, entry.amount])
                    else:
                        writer.writerow([entry.name, entry.source, entry.date, entry.description, entry.entry_type, entry.amount])
                
                return response
            
            case 'xlsx':
                response = HttpResponse(content_type='text/ms-excel')
                response['Content-Disposition'] = f'attachment; filename = BudgetTracker-{str(datetime.datetime.now().date())}.xlsx'

                wb = xlwt.Workbook(encoding='utf-8')
                ws = wb.add_sheet('BudgetTracker')

                row_num = 0

                font_style = xlwt.XFStyle()
                font_style.font.bold = True

                columns = [_('Name'), _('Source/Category'), _('Date'), _('Description'), _('Type'), _('Amount')]

                for col_num in range(len(columns)):
                    ws.write(row_num, col_num, columns[col_num], font_style)

                font_style = xlwt.XFStyle()

                # Holds all the needed data entries for exportation.
                data = []
                
                for entry in entries:
                    if entry.entry_type == _('Expense'):
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

        return HttpResponse(_("Export format not supported"))
    
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
        
    return HttpResponse(_("Export format not supported"))

def import_data(request):

    if request.method == 'POST':
        if request.user.is_authenticated:
            file = request.FILES.get('file')
            delete_previous = request.POST.get('delete_previous') == 'true'
            # print(delete_previous)

            if not file:
                return JsonResponse({'error': _('No file provided')}, status=400)

            file_type = file.name.split('.')[-1].lower()

            try:
                if file_type == 'csv':
                    df = pd.read_csv(file)
                elif file_type in ['xls', 'xlsx']:
                    df = pd.read_excel(file)
                else:
                    messages.error(request, _('Unsupported file format'))
                    return JsonResponse({'error': _('Unsupported file format')})
                
                # Check that the file has all the needed columns. From each language.
                if df.columns[0] == 'Name':
                    required_columns = ['Name', 'Source/Category', 'Date', 'Description', 'Type', 'Amount']
                    lang = 'en'
                
                elif df.columns[0] == 'Nombre':
                    required_columns = ['Nombre', 'Fuente/Categoria', 'Fecha', 'Descripción', 'Tipo','Monto' ]
                    lang = 'es'
                
                elif df.columns[0] == '名前':
                    required_columns = ['名前', 'ソース/カテゴリ', '日付', '説明', 'タイプ', '金額']
                    lang = 'ja'
                
                else:
                    messages.error(request, _('Wrong amount of columns or names.'))
                    return JsonResponse({'error': _('Wrong amount of columns or names.')}, status=400)

                if not all(column in df.columns for column in required_columns):
                    messages.error(request, _('Wrong amount of columns or names.'))
                    return JsonResponse({'error': _('Wrong amount of columns or names.')}, status=400)
                
                # Clear existing records if the user requested it.
                if delete_previous == True:
                    Expense.objects.filter(user=request.user).delete()
                    Income.objects.filter(user=request.user).delete()
                
                # We get the language of the page and change it temporarily to the one of the file if needed to be able to import the data.
                currentLang = translation.get_language()
                
                if currentLang != lang:
                    translation.activate(lang)

                # print(df)

                for index, row in df.iterrows():
                    # print(row)
                    if row[_('Type')] == _('Expense'):
                        ## GET ALL THE LANGUAGES FOR THE CATEGORY.
                        categoryLang = Category.objects.get(name=row.iloc[1])
                        Expense.objects.create(
                            user=request.user,
                            name=row[_('Name')],
                            category=categoryLang.name_en,
                            category_en=categoryLang.name_en,
                            category_es=categoryLang.name_es,
                            category_ja=categoryLang.name_ja,
                            amount=row[_('Amount')],
                            description=row[_('Description')],
                            date=row[_('Date')],
                        )
                    else:
                        ## GET ALL THE LANGUAGES FOR THE SOURCE.
                        sourceLang = Source.objects.get(name=row.iloc[1])
                        Income.objects.create(
                            user=request.user,
                            name=row[_('Name')],
                            source=sourceLang.name_en,
                            source_en =sourceLang.name_en,
                            source_es =sourceLang.name_es,
                            source_ja =sourceLang.name_ja,
                            amount=row[_('Amount')],
                            description=row[_('Description')],
                            date=row[_('Date')],
                        )
                
                # If the page language was changed we set it back to what it was.
                if currentLang != lang:
                    translation.activate(currentLang)

                messages.success(request, _('Data imported successfully'))
                return JsonResponse({'success': True})

            except Exception as e:
                messages.error(request, _('Error processing file: {}').format(e))
                return JsonResponse({'error': _('Error processing file: {}').format(e)}, status=400)
    else:
        form = UploadFileForm()
