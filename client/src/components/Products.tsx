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
  Loader,
  Form
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

  handleBrandChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newBrandName: event.target.value })
  }

  onEditButtonClick = (productId: string) => {
    this.props.history.push(`/products/${productId}/edit`)
  }

  onProductCreate = async (event: React.FormEvent<HTMLFormElement>) => {
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
      <Form  onSubmit={this.onProductCreate}>
        <Form.Field>
          <label>Product Name</label>
          <input onChange={this.handleNameChange} placeholder='Product Name' />
        </Form.Field>
        <Form.Field>
          <label>Brand Name</label>
          <input onChange={this.handleBrandChange} placeholder='Brand Name' />
        </Form.Field>
        <Button type='submit'>Add Product</Button>
      </Form>
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
          Loading Products
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
              <Grid.Column field="Product Name" width={5} verticalAlign="middle">
                {product.productName}
              </Grid.Column>
              <Grid.Column width={4} verticalAlign="middle">
                {product.brand}
              </Grid.Column>
              <Grid.Column width={5} verticalAlign="middle">
                {product.productId}
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
