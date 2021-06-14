// @flow

import React from 'react'
import { useQuery, useMutation } from "react-apollo"
import { v4 } from "uuid"
import { withTranslation } from 'react-i18next'
import { withRouter } from "react-router"
import { Link } from 'react-router-dom'


import {
  Page,
  Grid,
  Icon,
  Dimmer,
  Badge,
  Button,
  Card,
  Container,
  Table
} from "tabler-react";
import SiteWrapper from "../../SiteWrapper"
import HasPermissionWrapper from "../../HasPermissionWrapper"
// import { confirmAlert } from 'react-confirm-alert'; // Import
import { toast } from 'react-toastify'

import confirm_delete from "../../../tools/confirm_delete"
import ContentCard from "../../general/ContentCard"
import CardHeaderSeparator from "../../general/CardHeaderSeparator"
import OrganizationMenu from "../OrganizationMenu"
import OrganizationGroupsSubscriptionsBase from "./OrganizationSubscriptionsGroupsBase"

import { GET_SUBSCRIPTION_GROUPS_QUERY, DELETE_SUBSCRIPTION_GROUP } from "./queries"


function OrganizationSubscriptionsGroups({ t, history }) {
  const { loading, error, data, fetchMore } = useQuery(GET_SUBSCRIPTION_GROUPS_QUERY)
  const [deleteSubscriptionGroup] = useMutation(DELETE_SUBSCRIPTION_GROUP)

  if (loading) return (
    <OrganizationGroupsSubscriptionsBase>
      <ContentCard cardTitle={t('organization.subscription_groups.title')}>
        <Dimmer active={true}
                loader={true}>
        </Dimmer>
      </ContentCard>
    </OrganizationGroupsSubscriptionsBase>
  )
  // Error
  if (error) return (
    <OrganizationGroupsSubscriptionsBase>
      <ContentCard cardTitle={t('organization.subscription_groups.title')}>
        <p>{t('organization.subscription_groups.error_loading')}</p>
      </ContentCard>
    </OrganizationGroupsSubscriptionsBase>
  )

  const subscription_groups = data.organizationSubscriptionGroups
  
  // Empty list
  if (!subscription_groups.edges.length) return (
    <OrganizationGroupsSubscriptionsBase>
      <ContentCard cardTitle={t('organization.subscription_groups.title')}>
        <p>{t('organization.subscription_groups.empty_list')}</p>
      </ContentCard>
    </OrganizationGroupsSubscriptionsBase>
  )

  return (
    <OrganizationGroupsSubscriptionsBase>
      <ContentCard cardTitle={t('organization.subscription_groups.title')}
            pageInfo={subscription_groups.pageInfo}
            onLoadMore={() => {
            fetchMore({
              variables: {
                after: subscription_groups.pageInfo.endCursor
              },
              updateQuery: (previousResult, { fetchMoreResult }) => {
                const newEdges = fetchMoreResult.organizationSubscriptionGroups.edges
                const pageInfo = fetchMoreResult.organizationSubscriptionGroups.pageInfo

                return newEdges.length
                  ? {
                      // Put the new subscription_groups at the end of the list and update `pageInfo`
                      // so we have the new `endCursor` and `hasNextPage` values
                      organizationSubscriptionGroups: {
                        __typename: previousResult.organizationSubscriptionGroups.__typename,
                        edges: [ ...previousResult.organizationSubscriptionGroups.edges, ...newEdges ],
                        pageInfo
                      }
                    }
                  : previousResult
              }
            })
          }} >
        <Table>
          <Table.Header>
          <Table.Row key={v4()}>
            <Table.ColHeader>{t('general.name')}</Table.ColHeader>
            <Table.ColHeader>{t('general.description')}</Table.ColHeader>
          </Table.Row>
          </Table.Header>
          <Table.Body>
            {subscription_groups.edges.map(({ node }) => (
              <Table.Row key={v4()}>
                <Table.Col key={v4()}>
                  {node.name}
                </Table.Col>
                <Table.Col key={v4()}>
                  {node.description.substring(0, 24)}
                </Table.Col>
                <Table.Col className="text-right" key={v4()}>
                  <span>
                    <Button className='btn-sm' 
                            onClick={() => history.push("/organization/subscriptions/groups/edit/" + node.id)}
                            color="secondary">
                      {t('general.edit')}
                    </Button>
                    <Button className='btn-sm' 
                            onClick={() => history.push("/organization/subscriptions/groups/edit/subscriptions/" + node.id)}
                            color="secondary">
                      {t('organization.subscriptions.groups.edit_subscriptions')}
                    </Button>
                  </span>
                </Table.Col>
                {/* <Mutation mutation={ARCHIVE_SUBSCRIPTION_GROUP} key={v4()}>
                  {(archiveCostcenter, { data }) => (
                    <Table.Col className="text-right" key={v4()}>
                      <button className="icon btn btn-link btn-sm" 
                          title={t('general.archive')} 
                          href=""
                          onClick={() => {
                            console.log("clicked archived")
                            let id = node.id
                            archiveCostcenter({ variables: {
                              input: {
                              id,
                              archived: !archived
                              }
                      }, refetchQueries: [
                          {query: GET_SUBSCRIPTION_GROUPS_QUERY, variables: {"archived": archived }}
                      ]}).then(({ data }) => {
                        console.log('got data', data);
                        toast.success(
                          (archived) ? t('general.unarchived'): t('general.archived'), {
                            position: toast.POSITION.BOTTOM_RIGHT
                          })
                      }).catch((error) => {
                        toast.error((t('general.toast_server_error')) + ': ' +  error, {
                            position: toast.POSITION.BOTTOM_RIGHT
                          })
                        console.log('there was an error sending the query', error);
                      })
                      }}>
                        <Icon prefix="fa" name="inbox" />
                      </button>
                    </Table.Col>
                  )}
                </Mutation> */}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </ContentCard>
    </OrganizationGroupsSubscriptionsBase>
  )
}

export default withTranslation()(withRouter(OrganizationSubscriptionsGroups))