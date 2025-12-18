#!/usr/bin/env python3
"""
Simple REST API using Flask
"""
from flask import Flask, request, jsonify

app = Flask(__name__)

# In-memory storage for items
items = []
next_id = 1


def find_item(item_id):
    """Find an item by ID"""
    return next((item for item in items if item['id'] == item_id), None)


def validate_item_data(data):
    """Validate item data"""
    if not data:
        return False, 'No data provided'
    if 'name' not in data:
        return False, 'Name is required'
    if not data['name'].strip():
        return False, 'Name cannot be empty'
    return True, ''


@app.route('/items', methods=['GET'])
def get_items():
    """
    Get all items
    ---
    responses:
      200:
        description: List of items
    """
    return jsonify(items), 200


@app.route('/items/<int:item_id>', methods=['GET'])
def get_item(item_id):
    """
    Get a single item by ID
    ---
    parameters:
      - name: item_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Item data
      404:
        description: Item not found
    """
    item = find_item(item_id)
    if not item:
        return jsonify({'error': 'Item not found'}), 404
    return jsonify(item), 200


@app.route('/items', methods=['POST'])
def create_item():
    """
    Create a new item
    ---
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            name:
              type: string
            description:
              type: string
    responses:
      201:
        description: Item created successfully
      400:
        description: Invalid data
    """
    global next_id
    
    data = request.get_json()
    
    is_valid, error_msg = validate_item_data(data)
    if not is_valid:
        return jsonify({'error': error_msg}), 400
    
    # Create new item
    new_item = {
        'id': next_id,
        'name': data['name'].strip(),
        'description': data.get('description', '').strip() if data.get('description') else ''
    }
    
    items.append(new_item)
    next_id += 1
    
    return jsonify(new_item), 201


@app.route('/items/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    """
    Update an existing item
    ---
    parameters:
      - name: item_id
        in: path
        type: integer
        required: true
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            name:
              type: string
            description:
              type: string
    responses:
      200:
        description: Item updated successfully
      400:
        description: Invalid data
      404:
        description: Item not found
    """
    item = find_item(item_id)
    if not item:
        return jsonify({'error': 'Item not found'}), 404
    
    data = request.get_json()
    
    is_valid, error_msg = validate_item_data(data)
    if not is_valid:
        return jsonify({'error': error_msg}), 400
    
    # Update item
    item['name'] = data['name'].strip()
    item['description'] = data.get('description', '').strip() if data.get('description') else ''
    
    return jsonify(item), 200


@app.route('/items/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    """
    Delete an item
    ---
    parameters:
      - name: item_id
        in: path
        type: integer
        required: true
    responses:
      204:
        description: Item deleted successfully
      404:
        description: Item not found
    """
    item = find_item(item_id)
    if not item:
        return jsonify({'error': 'Item not found'}), 404
    
    items.remove(item)
    return '', 204


if __name__ == '__main__':
    # Run the application
    app.run(host='0.0.0.0', port=5000, debug=False)
