interface Raw {
  name: string;
  parent: string;
  amount?: number;
}

interface Action {
  type: string
  payload?: any
}

interface Bubble {
  name: string
  parent: string
  amount?: number
}

interface BubbleWithId extends Bubble {
  id: string
}

interface MyDataType {
  value?: number
  data?: BubbleWithId
}
