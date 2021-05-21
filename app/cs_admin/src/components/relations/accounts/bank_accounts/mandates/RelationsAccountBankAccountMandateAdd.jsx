// @flow

import React, {Component } from 'react'
import gql from "graphql-tag"
import { useQuery, useMutation } from '@apollo/react-hooks'
import { withTranslation } from 'react-i18next'
import { withRouter } from "react-router"
import { Link } from 'react-router-dom'

import { Formik } from 'formik'
import { toast } from 'react-toastify'

import { CREATE_ACCOUNT_BANK_ACCOUNT_MANDATE } from './queries'
import { GET_ACCOUNT_BANK_ACCOUNTS_QUERY } from '../queries'
// import { SUBSCRIPTION_SCHEMA } from './yupSchema'
import RelationsAccountBankAccountMandateForm from './RelationsAccountBankAccountMandateForm'

import {
  Page,
  Grid,
  Icon,
  Button,
  Card,
  Container,
} from "tabler-react";
import SiteWrapper from "../../../SiteWrapper"
import HasPermissionWrapper from "../../../HasPermissionWrapper"
import { dateToLocalISO } from '../../../../tools/date_tools'

import RelationsAccountBankAccountBase from '../RelationsAccountBankAccountBase'


function RelationsAccountBankAccountMandateAdd({ t, match, history }) {
  const accountId = match.params.account_id
  const bankAccountId = match.params.bank_account_id
  const return_url = `/relations/accounts/${accountId}/bank_accounts`

  const [createAccountBankAccountMandate] = useMutation(CREATE_ACCOUNT_BANK_ACCOUNT_MANDATE) 
 

  return (
    <RelationsAccountBankAccountBase showBack={true}>
      <Card>
        <Card.Header>
          <Card.Title>{t('relations.account.bank_accounts.mandates.title_add')}</Card.Title>
        </Card.Header>
        <Formik
          initialValues={{
            reference: "",
            content: "",
            signatureDate: new Date()
          }}
          // validationSchema={INVOICE_GROUP_SCHEMA}
          onSubmit={(values, { setSubmitting }) => {
            console.log('submit values:')
            console.log(values)

            createInvoice({ variables: {
              input: {
                accountBankAccount: bankAccountId,
                reference: values.refrence, 
                content: values.content,
                signatureDate: dateToLocalISO(values.signatureDate)
              }
            }, refetchQueries: [
              {query: GET_ACCOUNT_BANK_ACCOUNTS_QUERY, variables: { account: accountId }}
            ]})
            .then(({ data }) => {
                console.log('got data', data)
                toast.success((t('relations.account.bank_accounts.mandates.title_add')), {
                    position: toast.POSITION.BOTTOM_RIGHT
                  })
                // history.push('/finance/invoices/edit/' + data.createFinanceInvoice.financeInvoice.id)
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
          {({ isSubmitting, errors, values, submitForm, setFieldTouched, setFieldValue }) => (
            <RelationsAccountBankAccountMandateForm
              isSubmitting={isSubmitting}
              errors={errors}
              values={values}
              submitForm={submitForm}
              setFieldTouched={setFieldTouched}
              setFieldValue={setFieldValue}
              return_url={return_url}
            >
            </RelationsAccountBankAccountMandateForm>   
          )}
        </Formik>
      </Card>
    </RelationsAccountBankAccountBase>
  )
}


export default withTranslation()(withRouter(RelationsAccountBankAccountMandateAdd))
