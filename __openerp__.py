{
    'name' : 'OpenERP Pet Store',
    'version': '1.0',
    'summary': 'Sell pet toys',
    'category': 'pet_store',
    'description':
        """
OpenERP Pet Store
=================

A wonderful application to sell pet toys.
        """,
    'data': [
        "security/oeptstore_security.xml",
        "security/ir.model.access.csv",
        "petstore_view.xml",
        "manager_corn.xml",
    ],
    'depends' : ['nantian_erp'],
    'qweb': ['static/src/xml/*.xml'],
    'application': True,
}
