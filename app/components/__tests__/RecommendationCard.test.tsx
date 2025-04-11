import { render, screen } from '@testing-library/react';
import { RecommendationCard } from '../RecommendationCard';

const mockRecommendation = {
  id: 1,
  location: 'New York',
  date: new Date(),
  temperature: 20,
  weatherDescription: 'Sunny',
  recommendations: ['Wear sunscreen', 'Stay hydrated']
};

describe('RecommendationCard', () => {
  it('renders recommendation details correctly', () => {
    render(<RecommendationCard recommendation={mockRecommendation} />);
    
    expect(screen.getByText(/new york/i)).toBeInTheDocument();
    expect(screen.getByText(/20°C/i)).toBeInTheDocument();
    expect(screen.getByText(/sunny/i)).toBeInTheDocument();
    expect(screen.getByText(/wear sunscreen/i)).toBeInTheDocument();
    expect(screen.getByText(/stay hydrated/i)).toBeInTheDocument();
  });
}); 