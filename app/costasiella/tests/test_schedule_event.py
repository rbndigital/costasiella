# from graphql.error.located_error import GraphQLLocatedError
import graphql
import datetime

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from graphene.test import Client
from graphql_relay import to_global_id

# Create your tests here.
from django.contrib.auth.models import AnonymousUser, Permission

from . import factories as f
from .helpers import execute_test_client_api_query
from .. import models
from .. import schema
from ..modules.gql_tools import get_rid


class GQLScheduleEvent(TestCase):

    # https://docs.djangoproject.com/en/2.1/topics/testing/overview/
    fixtures = ['app_settings.json']

    def setUp(self):
        # This is run before every test
        self.admin_user = f.AdminUserFactory.create()
        self.anon_user = AnonymousUser()

        self.permission_view = 'view_scheduleevent'
        self.permission_add = 'add_scheduleevent'
        self.permission_change = 'change_scheduleevent'
        self.permission_delete = 'delete_scheduleevent'

        # self.account = f.RegularUserFactory.create()
        self.organization_level = f.OrganizationLevelFactory.create()
        self.organization_location = f.OrganizationLocationFactory.create()

        self.variables_query = {
            "archived": False
        }

        self.variables_create = {
            "input": {
                "organizationLocation": to_global_id("OrganizationLocationNode", self.organization_location.id),
                "organizationLevel": to_global_id("OrganizationLevelNode", self.organization_level.id),
                "name": "Created event",
                "tagline": "Tagline for event",
                "preview": "Event preview",
                "description": "Event description",
                "infoMailContent": "hello world"
            }
        }

        self.variables_update = {
            "input": {
                "organizationLocation": to_global_id("OrganizationLocationNode", self.organization_location.id),
                "organizationLevel": to_global_id("OrganizationLevelNode", self.organization_level.id),
                "name": "Updated event",
                "tagline": "Tagline for updated event",
                "preview": "Event preview updated",
                "description": "Event description updated",
                "infoMailContent": "hello world updated"
            }
        }

        self.events_query = '''
  query ScheduleEvents($before:String, $after:String, $archived:Boolean!) {
    scheduleEvents(first: 100, before: $before, after:$after, archived:$archived) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        node {
          id
          archived
          displayPublic
          displayShop
          autoSendInfoMail
          organizationLocation {
            id
            name
          }
          name
          tagline
          preview
          description
          organizationLevel {
            id
            name
          }
          teacher {
            id 
            fullName
          }
          teacher2 {
            id
            fullName
          }
          dateStart
          dateEnd
          timeStart
          timeEnd
          infoMailContent
          scheduleItems {
            edges {
              node {
                id
              }
            }
          }
          createdAt
          updatedAt
        }
      }
    }
  }
'''

        self.event_query = '''
  query ScheduleEvent($id: ID!) {
    scheduleEvent(id: $id) {
      id
      archived
      displayPublic
      displayShop
      autoSendInfoMail
      organizationLocation {
        id
        name
      }
      name
      tagline
      preview
      description
      organizationLevel {
        id
        name
      }
      teacher {
        id 
        fullName
      }
      teacher2 {
        id
        fullName
      }
      dateStart
      dateEnd
      timeStart
      timeEnd
      infoMailContent
      scheduleItems {
        edges {
          node {
            id
          }
        }
      }
      createdAt
      updatedAt
    }
  }
'''

        self.event_create_mutation = ''' 
  mutation CreateScheduleEvent($input:CreateScheduleEventInput!) {
    createScheduleEvent(input: $input) {
      scheduleEvent{
        id
        displayPublic
        displayShop
        autoSendInfoMail
        organizationLocation {
          id
        }
        organizationLevel {
          id
        }
        name
        tagline
        preview
        description
        infoMailContent
        teacher {
          id
        }
        teacher2 {
          id 
        }
      }
    }
  }
'''

        self.event_update_mutation = '''
  mutation UpdateScheduleEvent($input:UpdateScheduleEventInput!) {
    updateScheduleEvent(input: $input) {
      scheduleEvent{
        id
        displayPublic
        displayShop
        autoSendInfoMail
        organizationLocation {
          id
        }
        organizationLevel {
          id
        }
        name
        tagline
        preview
        description
        infoMailContent
        teacher {
          id
        }
        teacher2 {
          id 
        }
      }
    }
  }
'''

        self.event_archive_mutation = '''
  mutation ArchiveScheduleEvent($input: ArchiveScheduleEventInput!) {
    archiveScheduleEvent(input: $input) {
      scheduleEvent {
        id
        archived
      }
    }
  }
'''

    def tearDown(self):
        # This is run after every test
        pass

    def test_query(self):
        """ Query list of schedule events """
        query = self.events_query
        schedule_event = f.ScheduleEventFactory.create()

        executed = execute_test_client_api_query(query, self.admin_user, variables=self.variables_query)
        data = executed.get('data')

        self.assertEqual(data['scheduleEvents']['edges'][0]['node']['organizationLocation']['id'],
                         to_global_id("OrganizationLocationNode", schedule_event.organization_location.id))
        self.assertEqual(data['scheduleEvents']['edges'][0]['node']['name'], schedule_event.name)
        self.assertEqual(data['scheduleEvents']['edges'][0]['node']['tagline'], schedule_event.tagline)
        self.assertEqual(data['scheduleEvents']['edges'][0]['node']['preview'], schedule_event.preview)
        self.assertEqual(data['scheduleEvents']['edges'][0]['node']['description'], schedule_event.description)
        self.assertEqual(data['scheduleEvents']['edges'][0]['node']['infoMailContent'],
                         schedule_event.info_mail_content)
        self.assertEqual(data['scheduleEvents']['edges'][0]['node']['organizationLevel']['id'],
                         to_global_id("OrganizationLevelNode", schedule_event.organization_level.id))
        self.assertEqual(data['scheduleEvents']['edges'][0]['node']['teacher']['id'],
                         to_global_id("AccountNode", schedule_event.teacher.id))
        self.assertEqual(data['scheduleEvents']['edges'][0]['node']['teacher2']['id'],
                         to_global_id("AccountNode", schedule_event.teacher_2.id))

    def test_query_permission_denied_dont_show_nonpublic_events(self):
        """ Query list of events - check permission denied
        A user can query the invoices linked to their account, so an error will never be thrown
        But a user shouldn't be able to view orders from other accounts without additional permission
        """
        query = self.events_query
        schedule_event = f.ScheduleEventFactory.create()
        schedule_event.display_public = False
        schedule_event.save()

        # Create regular user
        user = f.RegularUserFactory()
        executed = execute_test_client_api_query(query, user, variables=self.variables_query)
        data = executed.get('data')

        # No items should be listed
        self.assertEqual(len(data['scheduleEvents']['edges']), 0)

    def test_query_permission_granted_show_nonpublic_events(self):
        """ Query list of schedule events with view permission """
        query = self.events_query
        schedule_event = f.ScheduleEventFactory.create()
        schedule_event.display_public = False
        schedule_event.save()

        # Create regular user
        user = f.RegularUserFactory()
        permission = Permission.objects.get(codename='view_scheduleevent')
        user.user_permissions.add(permission)
        user.save()

        executed = execute_test_client_api_query(query, user, variables=self.variables_query)
        data = executed.get('data')

        # List all events
        self.assertEqual(data['scheduleEvents']['edges'][0]['node']['organizationLocation']['id'],
                         to_global_id("OrganizationLocationNode", schedule_event.organization_location.id))

    def test_query_anon_user(self):
        """ Query list of schedule events - anon user """
        query = self.events_query
        schedule_event = f.ScheduleEventFactory.create()

        executed = execute_test_client_api_query(query, self.anon_user, variables=self.variables_query)
        print(executed)
        data = executed.get('data')

        # List all events
        self.assertEqual(data['scheduleEvents']['edges'][0]['node']['organizationLocation']['id'],
                         to_global_id("OrganizationLocationNode", schedule_event.organization_location.id))

    def test_query_one(self):
        """ Query one schedule event as admin """
        schedule_event = f.ScheduleEventFactory.create()

        variables = {
            "id": to_global_id("ScheduleEventNode", schedule_event.id),
        }

        # Now query single invoice and check
        executed = execute_test_client_api_query(self.event_query, self.admin_user, variables=variables)
        data = executed.get('data')

        self.assertEqual(data['scheduleEvent']['organizationLocation']['id'],
                         to_global_id("OrganizationLocationNode", schedule_event.organization_location.id))
        self.assertEqual(data['scheduleEvent']['name'], schedule_event.name)
        self.assertEqual(data['scheduleEvent']['tagline'], schedule_event.tagline)
        self.assertEqual(data['scheduleEvent']['preview'], schedule_event.preview)
        self.assertEqual(data['scheduleEvent']['description'], schedule_event.description)
        self.assertEqual(data['scheduleEvent']['infoMailContent'],
                         schedule_event.info_mail_content)
        self.assertEqual(data['scheduleEvent']['organizationLevel']['id'],
                         to_global_id("OrganizationLevelNode", schedule_event.organization_level.id))
        self.assertEqual(data['scheduleEvent']['teacher']['id'],
                         to_global_id("AccountNode", schedule_event.teacher.id))
        self.assertEqual(data['scheduleEvent']['teacher2']['id'],
                         to_global_id("AccountNode", schedule_event.teacher_2.id))

    def test_query_one_anon_user_nonpublic_not_allowed(self):
        """ Deny permission for anon users Query one schedule event """
        schedule_event = f.ScheduleEventFactory.create()
        schedule_event.display_public = False
        schedule_event.display_shop = False
        schedule_event.save()

        variables = {
            "id": to_global_id("ScheduleEventNode", schedule_event.id),
        }

        # Now query single invoice and check
        executed = execute_test_client_api_query(self.event_query, self.anon_user, variables=variables)
        errors = executed.get('errors')
        self.assertEqual(errors[0]['message'], 'Not logged in!')

    def test_query_one_anon_user_public_allowed(self):
        """ Deny permission for anon users Query one schedule event """
        schedule_event = f.ScheduleEventFactory.create()

        variables = {
            "id": to_global_id("ScheduleEventNode", schedule_event.id),
        }

        # Now query single invoice and check
        executed = execute_test_client_api_query(self.event_query, self.anon_user, variables=variables)
        data = executed['data']
        self.assertEqual(data['scheduleEvent']['organizationLocation']['id'],
                         to_global_id("OrganizationLocationNode", schedule_event.organization_location.id))

    def test_query_one_display_nonpublic_permission_denied(self):
        """ Don't list non-public events when user lacks authorization """
        schedule_event = f.ScheduleEventFactory.create()
        schedule_event.display_public = False
        schedule_event.display_shop = False
        schedule_event.save()
        # Create regular user
        user = f.RegularUserFactory()

        variables = {
            "id": to_global_id("ScheduleEventNode", schedule_event.id),
        }

        # Now query single event and check
        executed = execute_test_client_api_query(self.event_query, user, variables=variables)
        errors = executed.get('errors')
        self.assertEqual(errors[0]['message'], 'Permission denied!')

    def test_query_one_display_nonpublic_permission_granted(self):
        """ Respond with data when user has permission """
        schedule_event = f.ScheduleEventFactory.create()
        schedule_event.display_public = False
        schedule_event.display_shop = False
        schedule_event.save()
        # Create regular user
        user = f.RegularUserFactory()
        permission = Permission.objects.get(codename=self.permission_view)
        user.user_permissions.add(permission)
        user.save()

        variables = {
            "id": to_global_id("ScheduleEventNode", schedule_event.id),
        }

        # Now query single schedule event and check
        executed = execute_test_client_api_query(self.event_query, user, variables=variables)
        data = executed.get('data')
        self.assertEqual(data['scheduleEvent']['organizationLocation']['id'],
                         to_global_id("OrganizationLocationNode", schedule_event.organization_location.id))

    def test_create_schedule_event(self):
        """ Create a schedule event """
        query = self.event_create_mutation
        teacher = f.TeacherFactory.create()
        teacher2 = f.Teacher2Factory.create()
        self.variables_create['input']['teacher'] = to_global_id('AccountNode', teacher.id)
        self.variables_create['input']['teacher2'] = to_global_id('AccountNode', teacher2.id)

        executed = execute_test_client_api_query(
            query,
            self.admin_user,
            variables=self.variables_create
        )
        data = executed.get('data')

        self.assertEqual(data['createScheduleEvent']['scheduleEvent']['name'],
                         self.variables_create['input']['name'])
        self.assertEqual(data['createScheduleEvent']['scheduleEvent']['tagline'],
                         self.variables_create['input']['tagline'])
        self.assertEqual(data['createScheduleEvent']['scheduleEvent']['preview'],
                         self.variables_create['input']['preview'])
        self.assertEqual(data['createScheduleEvent']['scheduleEvent']['description'],
                         self.variables_create['input']['description'])
        self.assertEqual(data['createScheduleEvent']['scheduleEvent']['infoMailContent'],
                         self.variables_create['input']['infoMailContent'])
        self.assertEqual(data['createScheduleEvent']['scheduleEvent']['teacher']['id'],
                         self.variables_create['input']['teacher'])
        self.assertEqual(data['createScheduleEvent']['scheduleEvent']['teacher2']['id'],
                         self.variables_create['input']['teacher2'])

    def test_create_event_anon_user(self):
        """ Don't allow creating schedule events for non-logged in users """
        query = self.event_create_mutation
        teacher = f.TeacherFactory.create()
        teacher2 = f.Teacher2Factory.create()
        self.variables_create['input']['teacher'] = to_global_id('AccountNode', teacher.id)
        self.variables_create['input']['teacher2'] = to_global_id('AccountNode', teacher2.id)

        executed = execute_test_client_api_query(
            query,
            self.anon_user,
            variables=self.variables_create
        )
        data = executed.get('data')
        errors = executed.get('errors')
        self.assertEqual(errors[0]['message'], 'Not logged in!')

    def test_create_location_permission_granted(self):
        """ Allow creating events for users with permissions """
        query = self.event_create_mutation
        teacher = f.TeacherFactory.create()
        teacher2 = f.Teacher2Factory.create()
        self.variables_create['input']['teacher'] = to_global_id('AccountNode', teacher.id)
        self.variables_create['input']['teacher2'] = to_global_id('AccountNode', teacher2.id)

        account = f.RegularUserFactory.create()
        # Create regular user
        user = account
        permission = Permission.objects.get(codename=self.permission_add)
        user.user_permissions.add(permission)
        user.save()

        executed = execute_test_client_api_query(
            query,
            user,
            variables=self.variables_create
        )
        data = executed.get('data')
        self.assertEqual(data['createScheduleEvent']['scheduleEvent']['name'],
                         self.variables_create['input']['name'])

    def test_create_event_permission_denied(self):
        """ Check create event permission denied error message """
        query = self.event_create_mutation
        teacher = f.TeacherFactory.create()
        teacher2 = f.Teacher2Factory.create()
        self.variables_create['input']['teacher'] = to_global_id('AccountNode', teacher.id)
        self.variables_create['input']['teacher2'] = to_global_id('AccountNode', teacher2.id)

        account = f.RegularUserFactory.create()
        # Create regular user
        user = account
        executed = execute_test_client_api_query(
            query,
            user,
            variables=self.variables_create
        )
        data = executed.get('data')
        errors = executed.get('errors')
        self.assertEqual(errors[0]['message'], 'Permission denied!')

    def test_update_event(self):
        """ Update an event """
        query = self.event_update_mutation
        schedule_event = f.ScheduleEventFactory.create()
        self.variables_update['input']['id'] = to_global_id('ScheduleEventNode', schedule_event.id)

        executed = execute_test_client_api_query(
            query,
            self.admin_user,
            variables=self.variables_update
        )
        data = executed.get('data')
        
        self.assertEqual(data['updateScheduleEvent']['scheduleEvent']['name'],
                         self.variables_update['input']['name'])
        self.assertEqual(data['updateScheduleEvent']['scheduleEvent']['tagline'],
                         self.variables_update['input']['tagline'])
        self.assertEqual(data['updateScheduleEvent']['scheduleEvent']['preview'],
                         self.variables_update['input']['preview'])
        self.assertEqual(data['updateScheduleEvent']['scheduleEvent']['description'],
                         self.variables_update['input']['description'])
        self.assertEqual(data['updateScheduleEvent']['scheduleEvent']['infoMailContent'],
                         self.variables_update['input']['infoMailContent'])

    def test_update_event_anon_user(self):
        """ Don't allow updating events for non-logged in users """
        query = self.event_update_mutation
        schedule_event = f.ScheduleEventFactory.create()
        self.variables_update['input']['id'] = to_global_id('ScheduleEventNode', schedule_event.id)

        executed = execute_test_client_api_query(
            query,
            self.anon_user,
            variables=self.variables_update
        )
        data = executed.get('data')
        errors = executed.get('errors')
        self.assertEqual(errors[0]['message'], 'Not logged in!')

    def test_update_event_permission_granted(self):
        """ Allow updating event for users with permissions """
        query = self.event_update_mutation
        schedule_event = f.ScheduleEventFactory.create()
        self.variables_update['input']['id'] = to_global_id('ScheduleEventNode', schedule_event.id)

        user = f.RegularUserFactory.create()
        permission = Permission.objects.get(codename=self.permission_change)
        user.user_permissions.add(permission)
        user.save()

        executed = execute_test_client_api_query(
            query,
            user,
            variables=self.variables_update
        )
        data = executed.get('data')
        self.assertEqual(data['updateScheduleEvent']['scheduleEvent']['name'],
                         self.variables_update['input']['name'])

    def test_update_invoice_permission_denied(self):
        """ Check update event permission denied error message """
        query = self.event_update_mutation
        schedule_event = f.ScheduleEventFactory.create()
        self.variables_update['input']['id'] = to_global_id('ScheduleEventNode', schedule_event.id)

        user = f.RegularUserFactory.create()

        executed = execute_test_client_api_query(
            query,
            user,
            variables=self.variables_update
        )
        data = executed.get('data')
        errors = executed.get('errors')
        self.assertEqual(errors[0]['message'], 'Permission denied!')

    # def test_archive_event(self):
    #     """ Archive an event """
    #     query = self.invoice_delete_mutation
    #     invoice = f.FinanceInvoiceFactory.create()
    #     variables = {"input":{}}
    #     variables['input']['id'] = to_global_id('FinanceInvoiceNode', invoice.id)
    #
    #     executed = execute_test_client_api_query(
    #         query,
    #         self.admin_user,
    #         variables=variables
    #     )
    #     data = executed.get('data')
    #     self.assertEqual(data['deleteFinanceInvoice']['ok'], True)
    #
    # def test_delete_invoice_anon_user(self):
    #     """ Delete invoice denied for anon user """
    #     query = self.invoice_delete_mutation
    #     invoice = f.FinanceInvoiceFactory.create()
    #     variables = {"input":{}}
    #     variables['input']['id'] = to_global_id('FinanceInvoiceNode', invoice.id)
    #
    #     executed = execute_test_client_api_query(
    #         query,
    #         self.anon_user,
    #         variables=variables
    #     )
    #     data = executed.get('data')
    #     errors = executed.get('errors')
    #     self.assertEqual(errors[0]['message'], 'Not logged in!')
    #
    # def test_delete_invoice_permission_granted(self):
    #     """ Allow deleting invoices for users with permissions """
    #     query = self.invoice_delete_mutation
    #     invoice = f.FinanceInvoiceFactory.create()
    #     variables = {"input":{}}
    #     variables['input']['id'] = to_global_id('FinanceInvoiceNode', invoice.id)
    #
    #     # Give permissions
    #     user = invoice.account
    #     permission = Permission.objects.get(codename=self.permission_delete)
    #     user.user_permissions.add(permission)
    #     user.save()
    #
    #     executed = execute_test_client_api_query(
    #         query,
    #         user,
    #         variables=variables
    #     )
    #     data = executed.get('data')
    #     self.assertEqual(data['deleteFinanceInvoice']['ok'], True)
    #
    # def test_delete_invoice_permission_denied(self):
    #     """ Check delete invoice permission denied error message """
    #     query = self.invoice_delete_mutation
    #     invoice = f.FinanceInvoiceFactory.create()
    #     variables = {"input":{}}
    #     variables['input']['id'] = to_global_id('FinanceInvoiceNode', invoice.id)
    #
    #     user = invoice.account
    #
    #     executed = execute_test_client_api_query(
    #         query,
    #         user,
    #         variables=variables
    #     )
    #     data = executed.get('data')
    #     errors = executed.get('errors')
    #     self.assertEqual(errors[0]['message'], 'Permission denied!')
    #
