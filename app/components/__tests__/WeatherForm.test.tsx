import { render, screen, fireEvent } from '@testing-library/react';
import { WeatherForm } from '../WeatherForm';

describe('WeatherForm', () => {
  const mockOnWeatherData = jest.fn();

  beforeEach(() => {
    render(<WeatherForm onWeatherData={mockOnWeatherData} />);
  });

  it('renders the form correctly', () => {
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByText(/get recommendations/i)).toBeInTheDocument();
  });

  it('updates location input when typed', () => {
    const locationInput = screen.getByLabelText(/location/i);
    fireEvent.change(locationInput, { target: { value: 'New York' } });
    expect(locationInput).toHaveValue('New York');
  });

  it('shows error when submitting without location', () => {
    const submitButton = screen.getByText(/get recommendations/i);
    fireEvent.click(submitButton);
    expect(screen.getByText(/location is required/i)).toBeInTheDocument();
  });
}); 