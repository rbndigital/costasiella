// @flow

import React, { useContext } from 'react'
import { withTranslation } from 'react-i18next'
import { withRouter } from "react-router"
import { useQuery } from '@apollo/react-hooks'
import { Link } from 'react-router-dom'
import { v4 } from 'uuid'
import moment from 'moment'


import {
  Button,
  Card, 
  Grid,
  Icon,
  List,
  Media,
  Table,
} from "tabler-react";
import ShopContactBase from "./ShopContactBase"

import { GET_ORGANIZATION_QUERY } from "../../organization/organization/queries"


function ShopContact({ t, match, history }) {
  // The ID is fixed, as there's only one organization supported at the moment... easy peasy.
  const { loading, error, data, refetch } = useQuery(GET_ORGANIZATION_QUERY, {
    variables: { id: "T3JnYW5pemF0aW9uTm9kZToxMDA="}
  })

  if (loading) return (
    <ShopContactBase title={title} >
      {t("general.loading_with_dots")}
    </ShopContactBase>
  )
  if (error) return (
    <ShopContactBase title={title}>
      {t("shop.classpasses.error_loading")}
    </ShopContactBase>
  )

  console.log(data)
  console.log(data.organization)

  return (
    <ShopContactBase>
      Hello world!
    </ShopContactBase>
  )
}


export default withTranslation()(withRouter(ShopContact))
