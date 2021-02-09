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
  Grid
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

  handleStarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newStarRating: +event.target.value })
  }
  handleStoreChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newStoreName: event.target.value })
  }

  onEditButtonClick = (ratingId: string) => {
    this.props.history.push(`/products/ratings/${ratingId}/edit`)
  }

  onRatingCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
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
    return (
      <Grid.Row>
        <Grid.Column width={16}>
      <Input
        action={{
      color: 'teal',
        labelPosition: 'left',
        icon: 'add',
        content: 'New Rating',
        onClick: this.onRatingCreate
    }}
    fluid
    actionPosition="left"
    placeholder="Rating Stars"
    onChange={this.handleStarChange}
    />
    </Grid.Column>
    <Grid.Column width={16}>
      <Divider />
      </Grid.Column>
      </Grid.Row>
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
    return (
      <Grid padded>
      {this.state.ratings.map((rating, pos) => {
          return (
            <Grid.Row key={rating.ratingId}>
            <Grid.Column width={10} verticalAlign="middle">
            {rating.ratingId}
            </Grid.Column>
            <Grid.Column width={3} floated="right">
            {rating.stars}
            </Grid.Column>
            <Grid.Column width={1} floated="right">
            <Button
              icon
          color="blue"
          onClick={() => this.onEditButtonClick(rating.ratingId)}
        >
          <Icon name="pencil" />
            </Button>
            </Grid.Column>
            <Grid.Column width={1} floated="right">
            <Button
              icon
          color="red"
          onClick={() => this.onRatingDelete(rating.ratingId)}
        >
          <Icon name="delete" />
            </Button>
            </Grid.Column>
          <Grid.Column width={16}>
            <Divider />
            </Grid.Column>
            </Grid.Row>
        )
        })}
      </Grid>
    )
  }

  calculatePurchaseDate(): string {
    const date = new Date()
    const now = date.toISOString()
    return now
  }

}
