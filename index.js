// import liraries
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Animated, View, Text } from 'react-native'

const EASING_PREFIXES = ['easeInOut', 'easeOut', 'easeIn', 'ease']

// create a component
export default class Reveal extends Component {
  static propTypes = {
    position: PropTypes.oneOf(['bottom', 'left', 'right']),
    open: PropTypes.bool,
    buttonText: PropTypes.string,
    buttonHeight: PropTypes.number,
    duration: PropTypes.number,
    easing: PropTypes.oneOf(EASING_PREFIXES),
    style: ViewPropTypes.style,
    children: PropTypes.node,
  };

  static defaultProps = {
    position: 'bottom',
    buttonText: 'Reveal',
    open: false,
    buttonHeight: 50,
    duration: 300,
    easing: 'ease',
  };

  constructor(props) {
    super(props);
    this.state = {
      measuring: false,
      measured: false,
      height: 100,
      offset: 0,
      contentHeight: 0,
      animating: false,
    };
    this.animations = [
      new Animated.Value(0),
      new Animated.Value(0),
      new Animated.Value(0)
    ]
  }

  _measureContentHeight(callback) {
    this.setState({
      measuring: true,
    }, () => {
      requestAnimationFrame(() => {
        if (!this.contentContainer) {
          this.setState({
            measuring: false
          }, () => {
            callback(this.props.collapsedHeight)
          })
        } else {
          this.contentContainer.getNode().measure((x, y, width, height) => {
            this.setState({
              measuring: false,
              measured: true,
              contentHeight: height
            }, () => {
              callback(height)
            })
          })
        }
      })
    })
  }

  _handleCardToggle() {
    const toValue = this.props.open ? 0 : 1
    let easing = this.props.easing
    if (EASING_PREFIXES.indexOf(easing) === -1) {
      throw new Error('Unsupported easing type "' + this.props.easing + '"')
    }
    if (this.animate) {
      this.animate.stop();
    }
    this.setState({animating: true})
    this.animate = Animated.parallel([
      Animated.timing(this.animations[0], {
        toValue,
        duration: this.props.duration,
        easing: easing
      }),
      Animated.timing(this.animations[1], {
        toValue,
        duration: this.props.duration,
        delay: 75,
        easing: easing
      }),
      Animated.timing(this.animations[2], {
        toValue,
        duration: this.props.duration,
        delay: 150,
        easing: easing
      })
    ]).start(() => this.setState({ animating: false }))
    this.slideOpen = !this.slideOpen
  }

  render() {
    const { open, buttonText } = this.props
    const headingHeightInterpolate = this.animations[0].interpolate({
      inputRange: [0, 1],
      outputRange: [this.props.buttonHeight, 0],
      extrapolate: 'clamp'
    })
    const headingFadeInterpolate = this.animations[0].interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
      extrapolate: 'clamp'
    })
    const cardHeightInterpolate = this.animations[1].interpolate({
      inputRange: [0, 1],
      outputRange: [this.state.height - this.props.buttonHeight, 0],
      extrapolate: 'clamp'
    })
    const buttonMoveInterpolate = this.animations[1].interpolate({
      inputRange: [0, 1],
      outputRange: [30, 0],
      extrapolate: 'clamp'
    })
    const buttonFadeInterpolate = this.animations[2].interpolate({
      inputRange: [0, 1],
      outputRange: [0.95, 1],
      extrapolate: 'clamp'
    })
    const cardHeightStyle = {
      transform: [
        {
          translateY: cardHeightInterpolate
        }
      ]
    }
    const headingHeightStyle = {
      height: headingHeightInterpolate,
      opacity: headingFadeInterpolate
    }
    const buttonStyle = {
      transform: [
        {
          translateY: buttonMoveInterpolate
        }
      ],
      opacity: buttonFadeInterpolate
    }
    return (
      <Animated.View style={[styles.largeformCont, cardHeightStyle]}>
        <Animated.View style={[styles.topSection, headingHeightStyle]}>
          <TouchableOpacity style={styles.referralTextCont} onPress={() => this._handleCardToggle()}>
            <Animated.Text style={this.props.textStyle}>{buttonText}</Animated.Text>
          </TouchableOpacity>
        </Animated.View>
        <Animated.View onLayout={this.state.animating ? null : this._handleLayout} ref={(ref) => {this.contentContainer = ref}} style={[this.props.style, sectionStyle]}>
          {this.props.children}
        </Animated.View>
      </Animated.View>
    )
  }
}
