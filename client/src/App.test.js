import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app header', () => {
  render(<App />);
  const headerElement = screen.getByText(/AI Wardrobe/i);
  expect(headerElement).toBeInTheDocument();
});

test('renders upload section', () => {
  render(<App />);
  const uploadText = screen.getByText(/Upload Your Clothing Photo/i);
  expect(uploadText).toBeInTheDocument();
});

test('renders select image button', () => {
  render(<App />);
  const buttonElement = screen.getByText(/Select Image/i);
  expect(buttonElement).toBeInTheDocument();
});
