import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createProduct, deleteProduct, getProducts, patchProduct } from '../api/products-api'
import Auth from '../auth/Auth'
import { Product } from '../types/Product'

interface ProductsProps {
  auth: Auth
  history: History
}

interface ProductState {
  products: Product[]
  newProductName: string,
  newBrandName: string,
  loadingProducts: boolean
}

export class Products extends React.PureComponent<ProductsProps, ProductState> {
  state: ProductState = {
    products: [],
    newProductName: '',
    newBrandName: '',
    loadingProducts: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newProductName: event.target.value })
  }

  onEditButtonClick = (productId: string) => {
    this.props.history.push(`/products/${productId}/edit`)
  }

  onProductCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const newProduct = await createProduct(this.props.auth.getIdToken(), {
        productName: this.state.newProductName,
         brand: this.state.newBrandName
      })
      this.setState({
        products: [...this.state.products, newProduct],
        newProductName: ''
      })
    } catch {
      alert('Product creation failed')
    }
  }

  onProductDelete = async (productId: string) => {
    try {
      await deleteProduct(this.props.auth.getIdToken(), productId)
      this.setState({
        products: this.state.products.filter(product => product.productId != productId)
      })
    } catch {
      alert('Product deletion failed')
    }
  }

  onProductCheck = async (pos: number) => {
    try {
      const product = this.state.products[pos]
      await patchProduct(this.props.auth.getIdToken(), product.productId, {
        productName: product.productName,
        brand: product.brand
      })
    } catch {
      alert('Product update failed')
    }
  }

  async componentDidMount() {
    try {
      const products = await getProducts(this.props.auth.getIdToken())
      this.setState({
        products,
        loadingProducts: false
      })
    } catch (e) {
      alert(`Failed to fetch products: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Products</Header>

        {this.renderCreateProductInput()}

        {this.renderProducts()}
      </div>
    )
  }

  renderCreateProductInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New Product',
              onClick: this.onProductCreate
            }}
            fluid
            actionPosition="left"
            placeholder="Product Name"
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderProducts() {
    if (this.state.loadingProducts) {
      return this.renderLoading()
    }

    return this.renderProductsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading TODOs
        </Loader>
      </Grid.Row>
    )
  }

  renderProductsList() {
    return (
      <Grid padded>
        {this.state.products.map((product, pos) => {
          return (
            <Grid.Row key={product.productId}>
              <Grid.Column width={10} verticalAlign="middle">
                {product.productName}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {product.brand}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(product.productId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onProductDelete(product.productId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {product.attachmentUrl && (
                <Image src={product.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }
}
