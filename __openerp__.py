{
    'name' : 'OpenERP Pet Store',
    'version': '1.0',
    'summary': 'Sell pet toys',
    'category': 'Tools',
    'description':
        """
OpenERP Pet Store
=================

A wonderful application to sell pet toys.
        """,
    'data': [
        "petstore.xml",
        # "security/oeptstore_security.xml",
        "security/ir.model.access.csv",
    ],
    'depends' : ['nantian_erp'],
    'qweb': ['static/src/xml/*.xml'],
    'application': True,
}
