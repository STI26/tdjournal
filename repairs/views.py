from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from repairs.libs.repairs import DataRepairs
import json


@login_required()
def repairs(request):

    if request.method == 'POST':
        # Create class Repairs
        repairs = DataRepairs()

        # Get action name
        operation = request.headers.get('operation')

        # Get data received in ajax request
        data = json.loads(request.body)

        # Run current operation
        result = repairs.action(operation, request.user, data)

        return JsonResponse(result, safe=False)
    # If method 'GET'
    else:
        return render(request, 'repairs/repairs.html')
