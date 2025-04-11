import { render, screen } from '@testing-library/react';
import SearchHistory from '../SearchHistory';

describe('SearchHistory', () => {
  const mockSearches = [
    {
      id: 1,
      location: 'New York',
      date: '2024-04-11',
      temperature: 20,
      weatherDescription: 'Sunny'
    }
  ];

  const mockOnSelectHistory = jest.fn();

  it('renders no searches message when empty', () => {
    render(<SearchHistory searches={[]} onSelectHistory={mockOnSelectHistory} />);
    expect(screen.getByText(/no previous searches/i)).toBeInTheDocument();
  });

  it('renders search history items', () => {
    render(<SearchHistory searches={mockSearches} onSelectHistory={mockOnSelectHistory} />);
    expect(screen.getByText(/new york/i)).toBeInTheDocument();
    expect(screen.getByText(/20°C/i)).toBeInTheDocument();
    expect(screen.getByText(/sunny/i)).toBeInTheDocument();
  });
}); 