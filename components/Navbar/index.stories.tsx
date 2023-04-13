import Navbar from './'

export default {
  component: Navbar,
  title: 'Navbar',
}

const Template = (args: any) => <Navbar {...args} />

export const Default: any = Template.bind({})
Default.args = {
  //   image: 'https://images.unsplash.com/photo-1612459284970-e8f027596582?ixid:MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib:rb-1.2.1&auto:format&fit:crop&w:668&q:80',
  //   name: 'Sage Adebayo',
  //   isVerified: true,
  //   userId: '@galipkatarina',
}
