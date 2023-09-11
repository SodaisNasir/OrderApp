export const newOrders = [
  {
    id: 1,
    orderNumber: 'ORD123',
    address: '123 Main St, Cityville',
    totalAmount: 150.0,
    date: '2023-08-09',
    status: 'pending',
    details: [
      {
        product: 'Product A',
        quantity: 2,
        price: 50.0,
        addOns: [
          {name: 'Add-on 1', quantity: 1, price: 10.0},
          {name: 'Add-on 2', quantity: 2, price: 5.0},
        ],
      },
      {
        product: 'Product B',
        quantity: 1,
        price: 30.0,
        addOns: [
          {name: 'Add-on 1', quantity: 1, price: 10.0},
          {name: 'Add-on 2', quantity: 2, price: 5.0},
        ],
      },
    ],
  },
  {
    id: 2,
    orderNumber: 'ORD124',
    address: '456 Elm St, Townsville',
    totalAmount: 250.5,
    date: '2023-08-10',
    status: 'pending',
    details: [
      {
        product: 'Product C',
        quantity: 3,
        price: 40.0,
        addOns: [
          {name: 'Add-on 1', quantity: 1, price: 10.0},
          {name: 'Add-on 2', quantity: 2, price: 5.0},
        ],
      },
      {
        product: 'Product D',
        quantity: 2,
        price: 35.0,
        addOns: [
          {name: 'Add-on 1', quantity: 1, price: 10.0},
          {name: 'Add-on 2', quantity: 2, price: 5.0},
        ],
      },
    ],
  },
  {
    id: 3,
    orderNumber: 'ORD125',
    address: '789 Oak St, Villageton',
    totalAmount: 80.75,
    date: '2023-08-11',
    status: 'pending',
    details: [
      {
        product: 'Product E',
        quantity: 1,
        price: 80.75,
        addOns: [
          {name: 'Add-on 2', quantity: 2, price: 5.0},
        ],
      },
    ],
  },
  // Add more orders as needed
];

export const allOrders = [
  {
    id: 1,
    orderNumber: 'ORD123',
    address: '123 Main St, Cityville',
    totalAmount: 150.0,
    date: '2023-08-09',
    status: 'inprogress',
    details: [
      {
        product: 'Product A',
        quantity: 2,
        price: 50.0,
        addOns: [
          {name: 'Add-on 1', quantity: 1, price: 10.0},
          {name: 'Add-on 2', quantity: 2, price: 5.0},
        ],
      },
      {
        product: 'Product B',
        quantity: 1,
        price: 30.0,
        addOns: [
          {name: 'Add-on 1', quantity: 1, price: 10.0},
          {name: 'Add-on 2', quantity: 2, price: 5.0},
        ],
      },
    ],
  },
  {
    id: 2,
    orderNumber: 'ORD124',
    address: '456 Elm St, Townsville',
    totalAmount: 250.5,
    date: '2023-08-10',
    status: 'inprogress',
    details: [
      {
        product: 'Product A',
        quantity: 2,
        price: 50.0,
        addOns: [
          {name: 'Add-on 1', quantity: 1, price: 10.0},
          {name: 'Add-on 2', quantity: 2, price: 5.0},
        ],
      },
      {
        product: 'Product B',
        quantity: 1,
        price: 30.0,
        addOns: [
          {name: 'Add-on 1', quantity: 1, price: 10.0},
          {name: 'Add-on 2', quantity: 2, price: 5.0},
        ],
      },
    ],
  },
  {
    id: 3,
    orderNumber: 'ORD125',
    address: '789 Oak St, Villageton',
    totalAmount: 80.75,
    date: '2023-08-11',
    status: 'inprogress',
    details: [{product: 'Product E', quantity: 1, price: 80.75}],
  },
  // Add more orders as needed
];
export const completedOrders = [
  {
    id: 1,
    orderNumber: 'ORD123',
    address: '123 Main St, Cityville',
    totalAmount: 150.0,
    date: '2023-08-09',
    status: 'delivered',
    details: [
      {
        product: 'Product A',
        quantity: 2,
        price: 50.0,
        addOns: [
          {name: 'Add-on 1', quantity: 1, price: 10.0},
          {name: 'Add-on 2', quantity: 2, price: 5.0},
        ],
      },
      {
        product: 'Product B',
        quantity: 1,
        price: 30.0,
        addOns: [
          {name: 'Add-on 1', quantity: 1, price: 10.0},
          {name: 'Add-on 2', quantity: 2, price: 5.0},
        ],
      },
    ],
  },
  {
    id: 2,
    orderNumber: 'ORD124',
    address: '456 Elm St, Townsville',
    totalAmount: 250.5,
    date: '2023-08-10',
    status: 'delivered',
    details: [
      {product: 'Product C', quantity: 3, price: 40.0},
      {product: 'Product D', quantity: 2, price: 35.0},
    ],
  },
  {
    id: 3,
    orderNumber: 'ORD125',
    address: '789 Oak St, Villageton',
    totalAmount: 80.75,
    date: '2023-08-11',
    status: 'delivered',
    details: [{
      product: 'Product A',
      quantity: 2,
      price: 50.0,
      addOns: [
        {name: 'Add-on 1', quantity: 1, price: 10.0},
        {name: 'Add-on 2', quantity: 2, price: 5.0},
      ],
    },
    {
      product: 'Product B',
      quantity: 1,
      price: 30.0,
      addOns: [
        {name: 'Add-on 1', quantity: 1, price: 10.0},
        {name: 'Add-on 2', quantity: 2, price: 5.0},
      ],
    },],
  },
  // Add more orders as needed
];
