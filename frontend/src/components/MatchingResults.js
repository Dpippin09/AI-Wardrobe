import React, { useState } from 'react';
import styled from 'styled-components';

const ResultsContainer = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  margin: 40px auto;
  max-width: 1200px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h2`
  color: white;
  font-size: 2.5rem;
  margin-bottom: 15px;
  font-weight: 700;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.2rem;
  margin-bottom: 30px;
`;

const OriginalImageContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
`;

const OriginalImage = styled.img`
  max-width: 150px;
  max-height: 150px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  border: 3px solid #FFD700;
`;

const FilterBar = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 30px;
`;

const FilterButton = styled.button`
  background: ${props => props.active ? 'linear-gradient(135deg, #FFD700, #FFA500)' : 'rgba(255, 255, 255, 0.2)'};
  color: ${props => props.active ? '#333' : 'white'};
  border: 1px solid ${props => props.active ? '#FFD700' : 'rgba(255, 255, 255, 0.3)'};
  padding: 10px 20px;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #FFD700, #FFA500)' : 'rgba(255, 255, 255, 0.3)'};
    transform: translateY(-1px);
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
`;

const ProductCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 35px rgba(0, 0, 0, 0.2);
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 15px;
  background: #f0f0f0;
`;

const ProductImagePlaceholder = styled.div`
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, #f0f0f0, #e0e0e0);
  border-radius: 10px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 3rem;
`;

const ProductTitle = styled.h3`
  color: #333;
  font-size: 1.1rem;
  margin-bottom: 10px;
  font-weight: 600;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProductPrice = styled.div`
  color: #e74c3c;
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 10px;
`;

const ProductSource = styled.div`
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 10px;
  font-style: italic;
`;

const RelevanceScore = styled.div`
  background: linear-gradient(135deg, #6bcf7f, #4ecdc4);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-block;
  margin-bottom: 10px;
`;

const ProductLink = styled.a`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  display: inline-block;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }
`;

const ResetButton = styled.button`
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: block;
  margin: 0 auto;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
  }
`;

const NoResults = styled.div`
  text-align: center;
  color: white;
  font-size: 1.2rem;
  padding: 60px 20px;
  
  h3 {
    margin-bottom: 15px;
    font-size: 1.5rem;
  }
  
  p {
    opacity: 0.8;
  }
`;

const MatchingResults = ({ results, originalAnalysis, originalImage, onReset }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  if (!results || !results.products) {
    return (
      <ResultsContainer>
        <NoResults>
          <h3>No matches found</h3>
          <p>We couldn't find any matching products at the moment. Please try with a different image.</p>
          <ResetButton onClick={onReset} style={{marginTop: '30px'}}>
            Try Again
          </ResetButton>
        </NoResults>
      </ResultsContainer>
    );
  }

  // Extract unique categories from products
  const categories = ['all', ...new Set(results.recommendations?.map(rec => rec.item_type) || [])];
  
  // Filter products based on selected category
  const filteredProducts = selectedCategory === 'all' 
    ? results.products 
    : results.products.filter(product => {
        const matchingRec = results.recommendations?.find(rec => 
          product.search_term?.toLowerCase().includes(rec.item_type.toLowerCase())
        );
        return matchingRec?.item_type === selectedCategory;
      });

  return (
    <ResultsContainer>
      <Header>
        <Title>Perfect Matches Found! 🎉</Title>
        <Subtitle>Here are clothing items that would look great with your piece</Subtitle>
        
        <OriginalImageContainer>
          <OriginalImage src={originalImage} alt="Your clothing item" />
        </OriginalImageContainer>
      </Header>

      <FilterBar>
        {categories.map(category => (
          <FilterButton
            key={category}
            active={selectedCategory === category}
            onClick={() => setSelectedCategory(category)}
          >
            {category === 'all' ? 'All Items' : category.replace('_', ' ')}
          </FilterButton>
        ))}
      </FilterBar>

      {filteredProducts.length === 0 ? (
        <NoResults>
          <h3>No products found for this category</h3>
          <p>Try selecting a different category or search again.</p>
        </NoResults>
      ) : (
        <ProductGrid>
          {filteredProducts.map((product, index) => (
            <ProductCard key={index}>
              {product.image_url ? (
                <ProductImage 
                  src={product.image_url} 
                  alt={product.title}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : (
                <ProductImagePlaceholder>👔</ProductImagePlaceholder>
              )}
              <ProductImagePlaceholder style={{display: 'none'}}>👔</ProductImagePlaceholder>
              
              <RelevanceScore>
                {Math.round((product.relevance_score || 0.5) * 100)}% Match
              </RelevanceScore>
              
              <ProductTitle>{product.title}</ProductTitle>
              
              {product.price !== 'N/A' && (
                <ProductPrice>${product.price}</ProductPrice>
              )}
              
              <ProductSource>from {product.source}</ProductSource>
              
              {product.url && (
                <ProductLink 
                  href={product.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  View Product
                </ProductLink>
              )}
            </ProductCard>
          ))}
        </ProductGrid>
      )}

      <ResetButton onClick={onReset}>
        Upload Another Item
      </ResetButton>
    </ResultsContainer>
  );
};

export default MatchingResults;
