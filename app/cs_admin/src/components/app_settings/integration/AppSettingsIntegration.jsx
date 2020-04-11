// @flow

import React, {Component } from 'react'
import gql from "graphql-tag"
import { useQuery, useMutation } from "react-apollo"
import { withTranslation } from 'react-i18next'
import { withRouter } from "react-router"
import { Formik } from 'formik'
import { toast } from 'react-toastify'

import { GET_SYSTEM_SETTINGS_QUERY, UPDATE_SYSTEM_SETTING } from './queries'

import {
  Dimmer,
  Page,
  Grid,
  Icon,
  Button,
  Card,
  Container,
} from "tabler-react";
import SiteWrapper from "../../SiteWrapper"
import HasPermissionWrapper from "../../HasPermissionWrapper"

// import FinancePaymentMethodForm from './AppSettingsGeneralForm'
import AppSettingsBase from "../AppSettingsBase"
import AppSettingsIntegrationForm from "./AppSettingsIntegrationForm"


function AppSettingsIntegration({ t, match, history }) {
  const cardTitle = t("settings.integration.title")
  const sidebarActive = "integration"

  const { loading, error, data } = useQuery(GET_SYSTEM_SETTINGS_QUERY)
  const [ updateSettings, { data: updateData }] = useMutation(UPDATE_SYSTEM_SETTING)

  console.log('query data app settings')
  console.log(data)

  if (loading) {
    return (
      <AppSettingsBase 
          cardTitle={cardTitle}
          sidebarActive={sidebarActive}>  
        <Card.Body>
          <Dimmer active={true}
                  loader={true}>
          </Dimmer>
        </Card.Body>
      </AppSettingsBase>
    )
  }
  if (error) {
    return (
      <AppSettingsBase 
          cardTitle={cardTitle}
          sidebarActive={sidebarActive}>  
        <Card.Body>
          {t("settings.general.error_loading")}
        </Card.Body>
      </AppSettingsBase>
    )
  }


  return (
    <AppSettingsBase 
    cardTitle={cardTitle}
      sidebarActive={sidebarActive}
    >  
    <Formik
      initialValues={{ 
        mollie_api_key: data.systemSettings.edges[0].node.value
      }}
      // validationSchema={MOLLIE_SCHEMA}
      onSubmit={(values, { setSubmitting }, errors) => {
          console.log('submit values:')
          console.log(values)
          console.log(errors)

          updateSettings({ variables: {
            input: {
              setting: "integration_mollie_api_key",
              value: values.mollie_api_key
            }
          }, refetchQueries: [
              {query: GET_SYSTEM_SETTINGS_QUERY}
          ]})
          .then(({ data }) => {
              console.log('got data', data)
              toast.success((t('settings.general.toast_edit_success')), {
                  position: toast.POSITION.BOTTOM_RIGHT
              })
              setSubmitting(false)
            }).catch((error) => {
              toast.error((t('general.toast_server_error')) + ': ' +  error, {
                  position: toast.POSITION.BOTTOM_RIGHT
              })
              console.log('there was an error sending the query', error)
              setSubmitting(false)
            })
      }}
    >
      {({ isSubmitting, errors, values }) => (
        <AppSettingsIntegrationForm
          isSubmitting={isSubmitting}
          errors={errors}
          values={values}
        >
          {console.log(errors)}
        </AppSettingsIntegrationForm>
      )}
      </Formik>
    </AppSettingsBase>
  )
}


export default withTranslation()(withRouter(AppSettingsIntegration))