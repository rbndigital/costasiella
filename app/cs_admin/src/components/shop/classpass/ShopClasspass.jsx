// @flow

import React, {Component } from 'react'
import { withTranslation } from 'react-i18next'
import { withRouter } from "react-router"
import { useQuery } from '@apollo/react-hooks'
import { Link } from 'react-router-dom'

import {
  Grid,
  Icon,
  List
} from "tabler-react";
import ShopClasspassBase from "./ShopClasspassBase"
import ShopClasspassesPricingCard from "./ShopClasspassPricingCard"

import { GET_ORGANIZATION_CLASSPASS_QUERY } from "./queries"


function ShopClasspass({ t, match, history }) {
  const title = t("shop.home.title")
  const id = match.params.id
  const { loading, error, data } = useQuery(GET_ORGANIZATION_CLASSPASS_QUERY, {
    variables: { id: id }
  })

  if (loading) return (
    <ShopClasspassesBase title={title} >
      {t("general.loading_with_dots")}
    </ShopClasspassesBase>
  )
  if (error) return (
    <ShopClasspassesBase title={title}>
      {t("shop.classpass.error_loading")}
    </ShopClasspassesBase>
  )

  console.log(data)
  const classpass = data.organizationClasspass
  console.log(classpass)

  return (
    <ShopClasspassBase title={title}>
        <Grid.Row>
            <Grid.Col md={3}>
              <ShopClasspassesPricingCard classpass={classpass} />
            </Grid.Col>
          ))}
        </Grid.Row>
    </ShopClasspassBase>
  )
}


export default withTranslation()(withRouter(ShopClasspass))


{/* <Grid.Col sm={6} lg={3}>
<PricingCard active>
  <PricingCard.Category>{"Premium"}</PricingCard.Category>
  <PricingCard.Price>{"$49"} </PricingCard.Price>
  <PricingCard.AttributeList>
    <PricingCard.AttributeItem>
      <strong>10 </strong>
      {"Users"}
    </PricingCard.AttributeItem>
    <PricingCard.AttributeItem hasIcon available>
      {"Sharing Tools"}
    </PricingCard.AttributeItem>
    <PricingCard.AttributeItem hasIcon available>
      {"Design Tools"}
    </PricingCard.AttributeItem>
    <PricingCard.AttributeItem hasIcon available={false}>
      {"Private Messages"}
    </PricingCard.AttributeItem>
    <PricingCard.AttributeItem hasIcon available={false}>
      {"Twitter API"}
    </PricingCard.AttributeItem>
  </PricingCard.AttributeList>
  <PricingCard.Button active>{"Choose plan"} </PricingCard.Button>
</PricingCard>
</Grid.Col> */}