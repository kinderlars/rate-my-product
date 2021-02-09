import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Divider,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  Grid,
  Form, Table
} from 'semantic-ui-react'

import Auth from '../auth/Auth'
import { Rating } from '../types/Rating'

import {createRating, deleteRating, getRatings, patchRating} from "../api/ratings-api";


interface RatingsProps {
  auth: Auth
  history: History
}

interface RatingState {
  ratings: Rating[]
  newStarRating: number,
  newStoreName: string,
  productId: string,
  loadingRatings: boolean,
  newAttachmentUrl: string
}

export class Ratings extends React.PureComponent<RatingsProps, RatingState> {
  state: RatingState = {
    ratings: [],
    newStarRating: 0,
    newStoreName: '',
    productId: '',
    loadingRatings: true,
    newAttachmentUrl: ''
  }

  handleProductIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ productId: event.target.value })
  }

  handleStarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newStarRating: +event.target.value })
  }

  handleStoreChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newStoreName: event.target.value })
  }

  onEditButtonClick = (ratingId: string) => {
    this.props.history.push(`/products/ratings/${ratingId}/edit`)
  }

  onRatingCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    try {
      const purchaseDate = this.calculatePurchaseDate()
      const newRating = await createRating(this.props.auth.getIdToken(),this.state.productId,{
        store: this.state.newStoreName,
        stars: this.state.newStarRating,
        purchaseDate,
        attachmentUrl: ''
      })
      this.setState({
        ratings: [...this.state.ratings, newRating]
      })
    } catch {
      alert('Rating creation failed')
    }
  }

  onRatingDelete = async (ratingId: string) => {
    try {
      await deleteRating(this.props.auth.getIdToken(), ratingId)
      this.setState({
        ratings: this.state.ratings.filter(rating => rating.ratingId != ratingId)
      })
    } catch {
      alert('Rating deletion failed')
    }
  }

  onRatingCheck = async (pos: number) => {
    try {
      const rating = this.state.ratings[pos]
      await patchRating(this.props.auth.getIdToken(), rating.ratingId, {
        stars: rating.stars,
        purchaseDate: rating.purchaseDate
      })
    } catch {
      alert('Rating update failed')
    }
  }

  async componentDidMount() {
    try {
      const ratings = await getRatings(this.props.auth.getIdToken())
      this.setState({
        ratings,
        loadingRatings: false
      })
    } catch (e) {
      alert(`Failed to fetch ratings: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Ratings</Header>

    {this.renderCreateRatingInput()}

    {this.renderRatings()}
    </div>
  )
  }

  renderCreateRatingInput() {
    return(
      <Form onSubmit={this.onRatingCreate}>
        <Form.Field>
          <label>ProductId</label>
          <input onChange={this.handleProductIdChange} placeholder='ProductID' />
        </Form.Field>
        <Form.Field>
          <label>Store Name</label>
          <input onChange={this.handleStoreChange} placeholder='Store Name' />
        </Form.Field>
        <Form.Field>
          <label>Rating</label>
          <input onChange={this.handleStarChange} placeholder='Rating' />
        </Form.Field>
        <Button type='submit'>Add Rating</Button>
      </Form>
    )
  }

  renderRatings() {
    if (this.state.loadingRatings) {
      return this.renderLoading()
    }

    return this.renderRatingsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
      Loading Ratings
    </Loader>
    </Grid.Row>
  )
  }

  renderRatingsList() {
    return(
    this.state.ratings.map((rating, pos) => {
      return (
      <Table basic='very' celled collapsing>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Rating ID</Table.HeaderCell>
            <Table.HeaderCell>Stars</Table.HeaderCell>
            <Table.HeaderCell>Purchase Date</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell width={9}>
              {rating.ratingId}
            </Table.Cell>
            <Table.Cell width={5}>
              {rating.stars}
            </Table.Cell>
            <Table.Cell width={5}>
              {rating.purchaseDate}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                color="red"
                onClick={() => this.onRatingDelete(rating.ratingId)}
                >
                <Icon name="delete" />
              </Button>
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    )}))
  }

  calculatePurchaseDate(): string {
    const date = new Date()
    const now = date.toISOString()
    return now
  }

}
