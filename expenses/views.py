from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.paginator import Paginator
from django.template.loader import render_to_string
from django.http import JsonResponse, HttpResponse
from django.db.models import Sum
from preferences.models import UserPreferences
from .models import Category, Expense
from .forms import UploadFileForm
from weasyprint import HTML
import datetime, json, os, csv, xlwt, tempfile
import pandas as pd

# Create your views here.

# @login_required(login_url='/authentication/login')
def index(request):
    if request.user.is_authenticated:
        expenses = Expense.objects.filter(user=request.user)
        paginator = Paginator(expenses, 5)

        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)

        preferences = UserPreferences.objects.filter(user=request.user)[0] # Get the currency from the UserPreferences model.
        preferences = preferences.currency[:3]

        return render(request, 'expenses/index.html', {'page_obj': page_obj, 'preferences': preferences}) # Send the prefered currency from preferences also

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
                            category__istartswith=search_str, user=request.user)
        
        preferences = UserPreferences.objects.filter(user=request.user)[0] # Get the currency from the UserPreferences model.
        
        data = list(expenses.values())
        if data:
            data[0]['currency'] = preferences.currency[:3]
        
        return JsonResponse(data, safe=False)
    
    return JsonResponse({'error': 'Invalid request method'}, status=400)

def get_category(expense):
    return expense.category

def get_category_amount(category, expenses):
    amount = 0
    byCategory = expenses.filter(category=category)

    for item in byCategory:
        amount += item.amount

    return amount

def expenses_data(request):
    
    if request.method == 'GET':
        today = datetime.date.today()
        # lastMonth = today.datetime.timedelta(days = 30)
        # last6months = today.datetime.timedelta(days = 30*6)
        # lastyear = today.datetime.timedelta(days = 30*12)
        if request.user.is_authenticated:
            expenses = Expense.objects.filter(user=request.user)

            if expenses:

                finalRepresentation = {}

                categoryList = list(set(map(get_category, expenses)))

                for x in expenses:
                    for y in categoryList:
                        finalRepresentation[y] = get_category_amount(y, expenses)

                return JsonResponse({'expense_data': finalRepresentation}, safe=False)
            else:
                return JsonResponse({'error': 'No expenses to show.'}, status=404)
        
        return JsonResponse({'error': 'No expenses to show.'}, status=404)

def expenses_summary(request):
    if request.method == 'GET':
        if request.user.is_authenticated:
            expenses = Expense.objects.filter(user=request.user)
            
            if expenses:
                return render(request, 'expenses/expenses_summary.html', {'expenses': True})
            
            else:
                return render(request, 'expenses/expenses_summary.html')
        
        else:
            return render(request, 'expenses/expenses_summary.html')
    
    return render(request, 'expenses/expenses_summary.html')

def export_data(request):
    if request.user.is_authenticated:
        expenses = Expense.objects.filter(user=request.user)
        fileType = request.POST.get('filetype')

        match fileType:
            case 'csv':
                response = HttpResponse(content_type='text/csv')
                response['Content-Disposition'] = f'attachment; filename = Expenses-{str(datetime.datetime.now().date())}.csv'

                writer = csv.writer(response)
                writer.writerow(['Name', 'Category', 'Amount', 'Description', 'Date'])

                for expense in expenses:
                    writer.writerow([expense.name, expense.category, expense.amount, expense.description, expense.date])

                return response
            
            case 'excel':
                response = HttpResponse(content_type='text/ms-excel')
                response['Content-Disposition'] = f'attachment; filename = Expenses-{str(datetime.datetime.now().date())}.xlsx'

                wb = xlwt.Workbook(encoding='utf-8')
                ws = wb.add_sheet('Expenses')

                row_num = 0

                font_style = xlwt.XFStyle()
                font_style.font.bold = True

                columns = ['Name', 'Category', 'Amount', 'Description', 'Date']

                for col_num in range(len(columns)):
                    ws.write(row_num, col_num, columns[col_num], font_style)

                font_style = xlwt.XFStyle()

                rows = expenses.values_list('name', 'category', 'amount', 'description', 'date')
                # print(rows)

                for row in rows:
                    row_num += 1

                    for col_num in range(len(row)):
                        # print(f'Row_num: {row_num}, Col_Num: {col_num}, Content: {row[col_num]}')
                        ws.write(row_num, col_num, str(row[col_num]), font_style)
                
                wb.save(response)

                return response

            
            case 'pdf':
                response = HttpResponse(content_type='text/pdf')
                response['Content-Disposition'] = f'attachment; filename = Expenses-{str(datetime.datetime.now().date())}.pdf'
                response['Content-Transfer-Encoding'] = 'binary'

                html_string = render_to_string('expenses/pdf-output.html', {'expenses': expenses, 'total': expenses.aggregate(Sum('amount'))['amount__sum']})
                html = HTML(string=html_string)

                result = html.write_pdf()

                with tempfile.NamedTemporaryFile(delete=True) as product:
                    product.write(result)
                    product.flush()

                    product= open(product.name, 'rb')
                    response.write(product.read())

                return response

        return HttpResponse("Export format not supported")
        
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
                required_columns = ['Name', 'Category', 'Amount', 'Date', 'Description']
                if not all(column in df.columns for column in required_columns):
                    messages.error(request, 'Wrong amount of columns or names.')
                    return JsonResponse({'error': 'Wrong amount of columns or names.'}, status=400)
                
                # Clear existing records if the user requested it.
                if delete_previous == True:
                    Expense.objects.filter(user=request.user).delete()

                # print(df)

                for index, row in df.iterrows():
                    # print(row)
                    Expense.objects.create(
                        user=request.user,
                        name=row['Name'],
                        category=row['Category'],
                        amount=row['Amount'],
                        description=row['Description'],
                        date=row['Date'],
                    )

                messages.success(request, 'Expenses imported successfully')
                return JsonResponse({'success': True})

            except Exception as e:
                messages.error(request, f'Error processing file: {e}')
                return JsonResponse({'error': f'Error pocessing file: {e}'}, status=400)
    else:
        form = UploadFileForm()