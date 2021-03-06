import checkValidOptions from './options'

export default function ({types: t}) {
  return {
    visitor: {
      ArrowFunctionExpression (path, state) {
        const options = checkValidOptions(state)
        const componentName = path.parent.id.name

        const functionBody = path.get('body').get('body')
        const returnStatement = functionBody.find((c) => {
          return c.type === 'ReturnStatement'
        })

        const arg = returnStatement.get('argument')
        if (!arg.isJSXElement()) return

        let openingElement = arg.get('openingElement')
        openingElement.node.attributes.push(
          t.jSXAttribute(
            t.jSXIdentifier(options.attribute),
            t.stringLiteral(options.format(componentName))
          )
        )
      },
      ClassDeclaration (path, state) {
        let name = path.get('id')
        let properties = path.get('body').get('body')

        let render = properties.find(prop => {
          return (
            prop.isClassMethod() &&
            prop.get('key').isIdentifier({ name: 'render' })
          )
        })

        if (!render || !render.traverse) {
          return
        }

        const options = checkValidOptions(state)

        render.traverse({
          ReturnStatement (returnStatement) {
            const arg = returnStatement.get('argument')
            if (!arg.isJSXElement()) return

            let openingElement = arg.get('openingElement')
            openingElement.node.attributes.push(
              t.jSXAttribute(
                t.jSXIdentifier(options.attribute),
                t.stringLiteral(options.format(name.node.name))
              )
            )
          }
        })
      }
    }
  }
}
