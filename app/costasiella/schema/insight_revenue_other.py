from django.utils.translation import gettext as _
from django.utils import timezone
import graphene

from ..dudes import InsightRevenueDude
from ..modules.gql_tools import require_login_and_permission
from ..modules.finance_tools import display_float_as_amount


class RevenueOtherType(graphene.ObjectType):
    description = graphene.String()
    year = graphene.Int()
    total = graphene.List(graphene.Decimal)
    total_display = graphene.List(graphene.String)
    subtotal = graphene.List(graphene.Decimal)
    tax = graphene.List(graphene.Decimal)

    def resolve_description(self, info):
        return _("revenue_other")

    def resolve_total(self, info):
        insight_revenue_dude = InsightRevenueDude()
        year = self.year
        if not year:
            year = timezone.now().year

        data = insight_revenue_dude.get_revenue_total_in_category_for_year(year, 'OTHER')
        amounts = []
        for month in data:
            amounts.append(data[month])

        return amounts

    def resolve_total_display(self, info):
        insight_revenue_dude = InsightRevenueDude()
        year = self.year
        if not year:
            year = timezone.now().year

        data = insight_revenue_dude.get_revenue_total_in_category_for_year(year, 'OTHER')
        amounts = []
        for month in data:
            amounts.append(display_float_as_amount(data[month]))

        return amounts

    def resolve_subtotal(self, info):
        insight_revenue_dude = InsightRevenueDude()
        year = self.year
        if not year:
            year = timezone.now().year

        data = insight_revenue_dude.get_revenue_subtotal_in_category_for_year(year, 'OTHER')
        amounts = []
        for month in data:
            amounts.append(data[month])

        return amounts

    def resolve_tax(self, info):
        insight_revenue_dude = InsightRevenueDude()
        year = self.year
        if not year:
            year = timezone.now().year

        data = insight_revenue_dude.get_revenue_tax_in_category_for_year(year, 'OTHER')
        amounts = []
        for month in data:
            amounts.append(data[month])

        return amounts


class InsightRevenueOtherQuery(graphene.ObjectType):
    insight_revenue_other = graphene.Field(RevenueOtherType, year=graphene.Int())

    def resolve_insight_revenue_other(self,
                                      info,
                                      year=graphene.Int(required=True, default_value=timezone.now().year)):
        user = info.context.user
        require_login_and_permission(user, 'costasiella.view_insightrevenue')

        revenue_other = RevenueOtherType()
        revenue_other.year = year

        return revenue_other
