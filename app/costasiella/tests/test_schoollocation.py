import graphene
from django.test import TestCase
from graphene.test import Client

# Create your tests here.
from .. import models
from .. import schema as cs_schema

# Create schema object
schema = graphene.Schema(
    query=cs_schema.Query,
    mutation=cs_schema.Mutation
)

## Use django client?
# https://www.sam.today/blog/testing-graphql-with-graphene-django/

class GQL_school_location(TestCase):

    def test_create(self):
        """
        create a SchoolLocation using GQL
        """
        class MockUser:
            is_authenticated = True

        client = Client(schema)
        executed = client.execute(
'''
    mutation CreateSchoolLocation($name: String!, $displayPublic:Boolean!) {
        createSchoolLocation(name: $name, displayPublic: $displayPublic) {
        id
        name
        displayPublic
        }
    }
''',
variables={'name': 'test', 'displayPublic': True},
info={
    'context': {
        'user': MockUser()
        }
    }
)
        print(executed)
        assert 1 == 1
