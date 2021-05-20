// @flow

import React, { useContext } from 'react'
import { useQuery, useMutation } from "react-apollo";
import gql from "graphql-tag"
import { withTranslation } from 'react-i18next'
import { withRouter } from "react-router"
import { Formik } from 'formik'
import { toast } from 'react-toastify'

import moment from 'moment'

import { GET_PAYMENT_BATCHES_QUERY, GET_PAYMENT_BATCH_QUERY } from './queries'
// import { PAYMENT_BATCH_CATEGORY_SCHEMA } from './yupSchema'
import { get_list_query_variables } from "./tools"


import {
  Dimmer,
  Page,
  Grid,
  Icon,
  Button,
  Card,
  Container,
  Table,
} from "tabler-react"
import SiteWrapper from "../../SiteWrapper"
import HasPermissionWrapper from "../../HasPermissionWrapper"
import { dateToLocalISO } from '../../../tools/date_tools'
import BooleanBadge from "../../ui/BadgeBoolean"
import FinancePaymentBatchCategory from "../../ui/FinancePaymentBatchCategory"
import AppSettingsContext from '../../context/AppSettingsContext'

import FinanceMenu from '../FinanceMenu'
import FinancePaymentBatchViewBase from './FinancePaymentBatchViewBase'
import FinancePaymentCollectionBatchForm from './FinancePaymentCollectionBatchForm'
import BadgeBoolean from '../../ui/BadgeBoolean';

function FinancePaymentBatchView({ t, history, match }) {
  const appSettings = useContext(AppSettingsContext)
  const dateFormat = appSettings.dateFormat
  const batchType = match.params.batch_type
  const batchId = match.params.id
  const returnUrl = `/finance/paymentbatches/${batchType}`

  const { loading, error, data } = useQuery(GET_PAYMENT_BATCH_QUERY, {
    variables: { id: batchId }
  })
  // const [updateFinancePaymentBatch] = useMutation(UPDATE_PAYMENT_BATCH)

  // Loading
  if (loading) return (
    <FinancePaymentBatchViewBase>
      <p>{t("general.loading_with_dots")}</p>
    </FinancePaymentBatchViewBase>
  )
  // Error
  if (error) return (
    <FinancePaymentBatchViewBase>
      <p>{t('finance.payment_batch.error_loading')}</p>
    </FinancePaymentBatchViewBase>
  )

  const financePaymentBatch = data.financePaymentBatch

  return (
    <FinancePaymentBatchViewBase>
      <Grid.Row>
        <Grid.Col md={3}>
          <Card title={t("finance.payment_batch.title_batch_info")}>
            <Table cards>
              <Table.Body>
                <Table.Row>
                  <Table.Col>
                    {t("general.name")}
                  </Table.Col>
                  <Table.Col>
                    {financePaymentBatch.name}
                  </Table.Col>
                </Table.Row>
                <Table.Row>
                  <Table.Col>
                    {t('finance.payment_batch_categories.batch_category_type')}
                  </Table.Col>
                  <Table.Col>
                    <FinancePaymentBatchCategory categoryType={financePaymentBatch.batchType} />
                  </Table.Col>
                </Table.Row>
                <Table.Row>
                  <Table.Col>
                    {t('finance.payment_batches.batch_category')}
                  </Table.Col>
                  <Table.Col>
                    {
                      (financePaymentBatch.financePaymentBatchCategory) ? 
                        financePaymentBatch.financePaymentBatchCategory.name : 
                        t("general.invoices")
                    }
                  </Table.Col>
                </Table.Row>
                <Table.Row>
                  <Table.Col>
                    {t('finance.payment_batches.execution_date')}
                  </Table.Col>
                  <Table.Col>
                    {moment(financePaymentBatch.executionDate).format(dateFormat)}
                  </Table.Col>
                </Table.Row>
                <Table.Row>
                  <Table.Col>
                    {t('finance.payment_batches.include_zero_amounts')}
                  </Table.Col>
                  <Table.Col>
                    <BadgeBoolean value={financePaymentBatch.includeZeroAmounts} />
                  </Table.Col>
                </Table.Row>
              </Table.Body>
            </Table>
          </Card>
        </Grid.Col>
        <Grid.Col md={3}>
          <Card title={t("finance.payment_batch.title_batch_totals")}>
            <Card.Body>
              ...
            </Card.Body>
          </Card>
        </Grid.Col>
        <Grid.Col md={3}>
          <Card title={t("finance.payment_batch.title_batch_note")}>
            <Card.Body>
              {financePaymentBatch.note}
            </Card.Body>
          </Card>
        </Grid.Col>
        <Grid.Col md={3}>
          <Card title={t("finance.payment_batch.title_batch_exports")}>
            <Card.Body>
              ...
            </Card.Body>
          </Card>
        </Grid.Col>
      </Grid.Row>
      <Grid.Row>
        <Grid.Col>
          <Card title={t("finance.payment_batch.title_batch_items")}>
            <Card.Body>
              Items
            </Card.Body>
          </Card>
        </Grid.Col>
      </Grid.Row>
      {/* <Card>
        <Card.Header>
          <Card.Title>{cardTitle}</Card.Title>
        </Card.Header>
        <Formik
          initialValues={{ name: '', description: '', executionDate: new Date() }}
          // validationSchema={PAYMENT_BATCH_CATEGORY_SCHEMA}
          onSubmit={(values, { setSubmitting }) => {
            let input = {
                batchType: batchType.toUpperCase(),
                name: values.name, 
                executionDate: dateToLocalISO(values.executionDate),
                description: values.description,
                note: values.note,
                includeZeroAmounts: values.includeZeroAmounts
            }

            if (categoryType == "category") {
              input.year = values.year
              input.month = values.month
              input.financePaymentBatchCategory = values.financePaymentBatchCategory
            }

            addFinancePaymentBatch({ 
              variables: { input: input }, 
              refetchQueries: [
                {query: GET_PAYMENT_BATCHES_QUERY, variables: get_list_query_variables(batchType)}
            ]})
            .then(({ data }) => {
                console.log('got data', data);
                toast.success((t('finance.payment_batches.toast_add_success')), {
                    position: toast.POSITION.BOTTOM_RIGHT
                  })
              }).catch((error) => {
                toast.error((t('general.toast_server_error')) + ': ' +  error, {
                    position: toast.POSITION.BOTTOM_RIGHT
                  })
                console.log('there was an error sending the query', error)
                setSubmitting(false)
              })
          }}
          >
          {({ isSubmitting, errors, values, setFieldValue, setFieldTouched }) => (
              <FinancePaymentCollectionBatchForm
                inputValues={inputValues}
                create={true}
                invoices={invoices}
                category={category}
                isSubmitting={isSubmitting}
                setFieldTouched={setFieldTouched}
                setFieldValue={setFieldValue}
                values={values}
                errors={errors}
                returnUrl={returnUrl}
              />
          )}
        </Formik>
      </Card> */}
    </FinancePaymentBatchViewBase>
  )
}

export default withTranslation()(withRouter(FinancePaymentBatchView))