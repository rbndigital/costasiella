// @flow

import React, { Component } from 'react'
import { Query, Mutation } from "react-apollo"
import gql from "graphql-tag"
import { v4 } from "uuid"
import { withTranslation } from 'react-i18next'
import { withRouter } from "react-router"
import { Link } from 'react-router-dom'
import moment from 'moment'

import {
  Alert,
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
import SiteWrapper from "../../../../SiteWrapper"
import HasPermissionWrapper from "../../../../HasPermissionWrapper"
import { TimeStringToJSDateOBJ } from '../../../../../tools/date_tools'
// import { confirmAlert } from 'react-confirm-alert'; // Import
import { toast } from 'react-toastify'
import { class_edit_all_subtitle, represent_subscription_role } from "../tools"
import confirm_delete from "../../../../../tools/confirm_delete"

import ContentCard from "../../../../general/ContentCard"
import ClassEditBase from "../ClassEditBase"

import { GET_SCHEDULE_CLASS_SUBSCRIPTIONS_QUERY } from "./queries"


class ScheduleClassSubscriptions extends Component {
  constructor(props) {
    super(props)
    console.log("Schedule classs subscriptions props:")
    console.log(props)
  }

  render() {
    const t = this.props.t
    const match = this.props.match
    const history = this.props.history
    const classId = match.params.class_id

    const ButtonAdd = <HasPermissionWrapper permission="add" resource="scheduleitemsubscription">
      <Link to={"/schedule/classes/all/subscriptions/" + classId + "/add" } >
        <Button color="primary btn-block mb-6">
        <Icon prefix="fe" name="plus-circle" /> {t('schedule.classes.subscriptions.add')}
        </Button>
      </Link>
    </HasPermissionWrapper>

    return (
      <SiteWrapper>
      <div className="my-3 my-md-5">
        {console.log('ID here:')}
        {console.log(classId)}
        <Query query={GET_SCHEDULE_CLASS_SUBSCRIPTIONS_QUERY} variables={{ scheduleItem: classId }}>
          {({ loading, error, data, refetch, fetchMore }) => {
  
            // Loading
            if (loading) return (
              <ClassEditBase menu_active_link="subscriptions" card_title={t('schedule.classes.subscriptions.title')} sidebar_button={ButtonAdd}>
                <Dimmer active={true} loader={true} />
              </ClassEditBase>
            )
            // Error
            if (error) return (
              <ClassEditBase menu_active_link="subscriptions" card_title={t('schedule.classes.subscriptions.title')} sidebar_button={ButtonAdd}>
                <p>{t('schedule.classes.subscriptions.error_loading')}</p>
              </ClassEditBase>
            )
  
            const initialTimeStart = TimeStringToJSDateOBJ(data.scheduleItem.timeStart)
            const subtitle = class_edit_all_subtitle({
              t: t,
              location: data.scheduleItem.organizationLocationRoom.organizationLocation.name,
              locationRoom: data.scheduleItem.organizationLocationRoom.name,
              classtype: data.scheduleItem.organizationClasstype.name,
              starttime: initialTimeStart
            })
  
            // Empty list
            if (!data.scheduleItemSubscriptions.edges.length) { return (
              <ClassEditBase menu_active_link="subscriptions" card_title={t('schedule.classes.subscriptions.title')} sidebar_button={ButtonAdd}>
                <p>{t('schedule.classes.subscriptions.empty_list')}</p>
              </ClassEditBase>
            )} else {   
            // Life's good! :)
              return (
                <ClassEditBase 
                  menu_active_link="subscriptions" 
                  default_card={false} 
                  subtitle={subtitle}
                  sidebar_button={ButtonAdd}
                >
                <ContentCard 
                  cardTitle={t('schedule.classes.title_edit')}
                  // headerContent={headerOptions}
                  pageInfo={data.scheduleItemSubscriptions.pageInfo}
                  onLoadMore={() => {
                  fetchMore({
                    variables: {
                      after: data.scheduleItemSubscriptions.pageInfo.endCursor
                    },
                    updateQuery: (previousResult, { fetchMoreResult }) => {
                      const newEdges = fetchMoreResult.scheduleItemSubscriptions.edges
                      const pageInfo = fetchMoreResult.scheduleItemSubscriptions.pageInfo
  
                      return newEdges.length
                        ? {
                            // Put the new locations at the end of the list and update `pageInfo`
                            // so we have the new `endCursor` and `hasNextPage` values
                            data: { 
                              scheduleItemSubscriptions: {
                                __typename: previousResult.scheduleItemSubscriptions.__typename,
                                edges: [ ...previousResult.scheduleItemSubscriptions.edges, ...newEdges ],
                                pageInfo
                              }
                            }
                          }
                        : previousResult
                      }
                    })
                  }} >
                  <div>
                    <Table>
                      <Table.Header>
                        <Table.Row>
                          <Table.ColHeader>{t('general.subscription')}</Table.ColHeader>
                          <Table.ColHeader></Table.ColHeader>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {data.scheduleItemOrganizationSubscriptionGroups.edges.map(({ node }) => (
                          <Table.Row key={v4()}>
                            {console.log(node)}
                            <Table.Col key={v4()}> 
                              {node.organizationSubscriptionGroup.name}
                            </Table.Col>
                            {/* <Table.Col className="text-right" key={v4()}>
                              <Button className='btn-sm' 
                                      onClick={() => history.push("/schedule/classes/all/subscriptions/" + match.params.class_id + '/edit/' + node.id)}
                                      color="secondary">
                                {t('general.edit')}
                              </Button>
                            </Table.Col> */}
                            {/* <Mutation mutation={DELETE_SCHEDULE_CLASS_TEACHER} key={v4()}>
                              {(deleteScheduleItemSubscription, { data }) => (
                                <Table.Col className="text-right" key={v4()}>
                                  <button className="icon btn btn-link btn-sm" 
                                      title={t('general.delete')} 
                                      href=""
                                      onClick={() => {
                                        confirm_delete({
                                          t: t,
                                          msgConfirm: t('schedule.classes.subscriptions.delete_confirm_msg'),
                                          msgDescription: <p>{t('schedule.classes.subscriptions.delete_confirm_description')}</p>,
                                          msgSuccess: t('schedule.classes.subscriptions.deleted'),
                                          deleteFunction: deleteScheduleItemSubscription,
                                          functionVariables: { variables: {
                                            input: {
                                              id: node.id
                                            }
                                          }, refetchQueries: [
                                            {query: GET_SCHEDULE_CLASS_TEACHERS_QUERY, variables: { scheduleItem: match.params.class_id }}
                                          ]}
                                      })}}
                                  >
                                    <span className="text-red">
                                      <Icon prefix="fe" name="trash-2" />
                                    </span>
                                  </button>
                                </Table.Col>
                              )}
                            </Mutation> */}
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table>
                    </div>
                  </ContentCard>
                </ClassEditBase>
            )}}
          }
        </Query>
      </div>
    </SiteWrapper>
    )
  }

};

export default withTranslation()(withRouter(ScheduleClassSubscriptions))