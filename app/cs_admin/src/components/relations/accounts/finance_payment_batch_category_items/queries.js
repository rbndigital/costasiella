import gql from "graphql-tag"

export const GET_ACCOUNT_FINANCE_PAYMENT_BATCH_CATEGORY_ITEMS_QUERY = gql`
  query AccountFinancePaymentBatchCategoryItems($after: String, $before: String, $account: ID!) {
    accountFinancePaymentBatchCategoryItems(first: 15, before: $before, after: $after, account: $account) {
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
      edges {
        node {
          id
          financePaymentBatchCategory {
            id
            name
          }
          year
          month
          amountDisplay
          description
        }
      }
    }
  }
`

export const GET_ACCOUNT_CLASSPASS_QUERY = gql`
  query AccountClasspass($id: ID!, $accountId: ID!, $after: String, $before: String, $archived: Boolean!) {
    accountClasspass(id:$id) {
      id
      organizationClasspass {
        id
        name
      }
      dateStart
      dateEnd
      note
      createdAt
    }
    organizationClasspasses(first: 100, before: $before, after: $after, archived: $archived) {
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
      edges {
        node {
          id
          archived
          name
        }
      }
    }
    account(id:$accountId) {
      id
      firstName
      lastName
      email
      phone
      mobile
      isActive
    }
  }
`

export const GET_INPUT_VALUES_QUERY = gql`
  query AccountPaymentBatchCategoryItemInputValues($after: String, $before: String) {
    financePaymentBatchCategories(first: 100, before: $before, after: $after, archived: false) {
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
      edges {
        node {
          id
          name
          batchCategoryType
        }
      }
    }
  }
`

export const CREATE_ACCOUNT_FINANCE_PAYMENT_BATCH_CATEGORY_ITEM = gql`
  mutation CreateAccountFinancePaymentBatchCategoryItem($input: CreateAccountFinancePaymentBatchCategoryItemInput!) {
    createAccountFinancePaymentBatchCategoryItem(input: $input) {
      accountFinancePaymentBatchCategoryItem {
        id
      }
    }
  }
`
