from django.utils.translation import gettext as _

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from django.db.models import Q

import graphene
from graphene_django import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField

from allauth.account.models import EmailAddress

from ..modules.gql_tools import require_login_and_permission, get_rid


class UserType(DjangoObjectType):
    class Meta:
        model = get_user_model()


class AccountNode(DjangoObjectType):
    class Meta:
        model = get_user_model()
        filter_fields = ['is_active']
        interfaces = (graphene.relay.Node, )

    @classmethod
    def get_node(self, info, id):
        user = info.context.user
        require_login_and_permission(user, 'costasiella.view_account')
        #TODO: Add permission for accounts to get their own info or all info with view permission

        return self._meta.model.objects.get(id=id)


class GroupNode(DjangoObjectType):
    class Meta:
        model = Group
        filter_fields = ['name']
        interfaces = (graphene.relay.Node, )

    @classmethod
    def get_node(self, info, id):
        user = info.context.user
        require_login_and_permission(user, 'costasiella.view_group')

        return self._meta.model.objects.get(id=id)


class PermissionNode(DjangoObjectType):
    class Meta:
        model = Permission
        filter_fields = ['name']
        interfaces = (graphene.relay.Node, )

    @classmethod
    def get_node(self, info, id):
        user = info.context.user
        require_login_and_permission(user, 'costasiella.view_permission')

        return self._meta.model.objects.get(id=id)

# class PermissionType(DjangoObjectType):
#     class Meta:
#         model = Permission


# class CreateAccount(graphene.Mutation):
#     user = graphene.Field(AccountNode)

#     class Arguments:
#         email = graphene.String(required=True)
#         password = graphene.String(required=True)

#     # def mutate(self, info, username, password, email):
#     def mutate(self, info, password, email):
#         user = get_user_model()(
#             email=email,
#         )
#         user.set_password(password)
#         user.save()

#         return CreateAccount(user=user)

class CreateAccount(graphene.relay.ClientIDMutation):
    class Input:
        first_name = graphene.String(required=True)
        last_name = graphene.String(required=True)
        email = graphene.String(required=True)

    account = graphene.Field(AccountNode)

    @classmethod
    def mutate_and_get_payload(self, root, info, **input):
        user = info.context.user
        require_login_and_permission(user, 'costasiella.add_account')

        # verify email unique
        query_set = get_user_model().objects.filter(
            email = input['email']
        )

        #Don't insert duplicate records in the DB. If this records exist, fetch and return it
        if query_set.exists():
            raise Exception(_('An account is already registered with this e-mail address'))

        account = get_user_model()(
            first_name = input['first_name'],
            last_name = input['last_name'],
            email = input['email'],
            username = input['email']
        )
        account.save()

        # Insert Allauth email address 
        email_address = EmailAddress(
            user = account,
            email = account.email,
            verified = True,
            primary = True
        )
        email_address.save()

        return CreateAccount(account=account)


class UpdateAccountActive(graphene.relay.ClientIDMutation):
    class Input:
        id = graphene.ID(required=True)
        is_active = graphene.Boolean(required=True)

    account = graphene.Field(AccountNode)

    @classmethod
    def mutate_and_get_payload(self, root, info, **input):
        user = info.context.user
        require_login_and_permission(user, 'costasiella.delete_account')

        rid = get_rid(input['id'])

        account = get_user_model().objects.filter(id=rid.id).first()
        if not account:
            raise Exception('Invalid Account ID!')

        account.is_active = input['is_active']
        account.save(force_update=True)

        return UpdateAccountActive(account=account)


class DeleteAccount(graphene.relay.ClientIDMutation):
    class Input:
        id = graphene.ID(required=True)
        is_active = graphene.Boolean(required=True)

    ok = graphene.Boolean()

    @classmethod
    def mutate_and_get_payload(self, root, info, **input):
        user = info.context.user
        require_login_and_permission(user, 'costasiella.delete_account')

        rid = get_rid(input['id'])

        account = get_user_model().objects.filter(id=rid.id).first()
        if not account:
            raise Exception('Invalid Account ID!')

        ok = account.delete()

        return DeleteAccount(ok=ok)


# class DeleteOrganizationClasspassGroupClasspass(graphene.relay.ClientIDMutation):
#     class Input:
#         # id = graphene.ID(required=True)
#         organization_classpass_group = graphene.ID(required=True)
#         organization_classpass = graphene.ID(required=True)

#     ok = graphene.Boolean()
#     deleted_organization_classpass_group_classpass_id = graphene.ID()

#     @classmethod
#     def mutate_and_get_payload(self, root, info, **input):
#         user = info.context.user
#         require_login_and_permission(user, 'costasiella.delete_organizationclasspassgroupclasspass')

#         # rid = get_rid(input['id'])
#         rid_group = get_rid(input['organization_classpass_group'])
#         rid_pass = get_rid(input['organization_classpass'])

#         organization_classpass_group = OrganizationClasspassGroup.objects.get(pk=rid_group.id)
#         organization_classpass = OrganizationClasspass.objects.get(pk=rid_pass.id)

#         organization_classpass_group_classpass = OrganizationClasspassGroupClasspass.objects.filter(
#             organization_classpass_group = organization_classpass_group,
#             organization_classpass = organization_classpass
#         ).first()


#         ok = organization_classpass_group_classpass.delete()

#         return DeleteOrganizationClasspassGroupClasspass(
#             ok=ok
#         )


class AccountMutation(graphene.ObjectType):
    create_account = CreateAccount.Field()
    update_account_active = UpdateAccountActive.Field()


class AccountQuery(graphene.AbstractType):
    user = graphene.Field(UserType)
    account = graphene.relay.Node.Field(AccountNode)
    accounts = DjangoFilterConnectionField(AccountNode)
    group = graphene.relay.Node.Field(GroupNode)
    groups = DjangoFilterConnectionField(GroupNode)
    permission = graphene.relay.Node.Field(PermissionNode)
    permissions = DjangoFilterConnectionField(PermissionNode)


    def resolve_user(self, info):
        user = info.context.user
        if user.is_anonymous:
            raise Exception('Not logged in!')

        return user


    def resolve_accounts(self, info, is_active=False, **kwargs):
        user = info.context.user
        require_login_and_permission(user, 'costasiella.view_account')

        return get_user_model().objects.filter(is_active=is_active, is_superuser=False).order_by('first_name')


    def resolve_groups(self, info):
        user = info.context.user
        require_login_and_permission(user, 'costasiella.view_group')

        return Group.objects.all()


    def resolve_permissions(self, info):
        user = info.context.user
        require_login_and_permission(user, 'costasiella.view_permission')

        return Permission.objects.all()
        
