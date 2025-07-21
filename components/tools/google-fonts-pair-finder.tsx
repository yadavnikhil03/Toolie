"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Type, Search, RefreshCw, Copy, Heart, Download, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FontPair {
  id: string;
  primary: {
    name: string;
    family: string;
    category: string;
    weights: string[];
  };
  secondary: {
    name: string;
    family: string;
    category: string;
    weights: string[];
  };
  tags: string[];
  popularity: number;
}

const GoogleFontsPairFinder: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [styleFilter, setStyleFilter] = useState('all');
  const [fontPairs, setFontPairs] = useState<FontPair[]>([]);
  const [filteredPairs, setFilteredPairs] = useState<FontPair[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Popular Google Font Pairs
  const popularFontPairs: FontPair[] = [
    {
      id: '1',
      primary: { name: 'Playfair Display', family: 'Playfair Display', category: 'serif', weights: ['400', '700'] },
      secondary: { name: 'Source Sans Pro', family: 'Source Sans Pro', category: 'sans-serif', weights: ['300', '400', '600'] },
      tags: ['elegant', 'classic', 'editorial'],
      popularity: 95
    },
    {
      id: '2',
      primary: { name: 'Montserrat', family: 'Montserrat', category: 'sans-serif', weights: ['400', '600', '700'] },
      secondary: { name: 'Merriweather', family: 'Merriweather', category: 'serif', weights: ['300', '400'] },
      tags: ['modern', 'versatile', 'professional'],
      popularity: 92
    },
    {
      id: '3',
      primary: { name: 'Oswald', family: 'Oswald', category: 'sans-serif', weights: ['400', '600'] },
      secondary: { name: 'Open Sans', family: 'Open Sans', category: 'sans-serif', weights: ['300', '400'] },
      tags: ['bold', 'clean', 'corporate'],
      popularity: 88
    },
    {
      id: '4',
      primary: { name: 'Raleway', family: 'Raleway', category: 'sans-serif', weights: ['300', '400', '700'] },
      secondary: { name: 'Lora', family: 'Lora', category: 'serif', weights: ['400', '700'] },
      tags: ['sophisticated', 'readable', 'blog'],
      popularity: 85
    },
    {
      id: '5',
      primary: { name: 'Poppins', family: 'Poppins', category: 'sans-serif', weights: ['400', '600', '700'] },
      secondary: { name: 'Open Sans', family: 'Open Sans', category: 'sans-serif', weights: ['300', '400'] },
      tags: ['modern', 'geometric', 'friendly'],
      popularity: 90
    },
    {
      id: '6',
      primary: { name: 'Roboto Slab', family: 'Roboto Slab', category: 'serif', weights: ['400', '700'] },
      secondary: { name: 'Roboto', family: 'Roboto', category: 'sans-serif', weights: ['300', '400'] },
      tags: ['tech', 'modern', 'systematic'],
      popularity: 82
    },
    {
      id: '7',
      primary: { name: 'Dancing Script', family: 'Dancing Script', category: 'handwriting', weights: ['400', '700'] },
      secondary: { name: 'Josefin Sans', family: 'Josefin Sans', category: 'sans-serif', weights: ['300', '400'] },
      tags: ['creative', 'elegant', 'wedding'],
      popularity: 78
    },
    {
      id: '8',
      primary: { name: 'Libre Baskerville', family: 'Libre Baskerville', category: 'serif', weights: ['400', '700'] },
      secondary: { name: 'Source Sans Pro', family: 'Source Sans Pro', category: 'sans-serif', weights: ['300', '400'] },
      tags: ['classic', 'traditional', 'book'],
      popularity: 80
    }
  ];

  const categories = ['all', 'serif', 'sans-serif', 'handwriting', 'display', 'monospace'];
  const styles = ['all', 'elegant', 'modern', 'classic', 'bold', 'creative', 'professional'];

  useEffect(() => {
    setFontPairs(popularFontPairs);
    setFilteredPairs(popularFontPairs);
  }, []);

  // Load fonts when filtered pairs change
  useEffect(() => {
    filteredPairs.forEach(pair => {
      loadGoogleFont(pair.primary.family);
      loadGoogleFont(pair.secondary.family);
    });
  }, [filteredPairs]);

  useEffect(() => {
    let filtered = fontPairs;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(pair => 
        pair.primary.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pair.secondary.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pair.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(pair => 
        pair.primary.category === categoryFilter || pair.secondary.category === categoryFilter
      );
    }

    // Filter by style
    if (styleFilter !== 'all') {
      filtered = filtered.filter(pair => 
        pair.tags.includes(styleFilter)
      );
    }

    // Sort by popularity
    filtered.sort((a, b) => b.popularity - a.popularity);

    setFilteredPairs(filtered);
  }, [searchQuery, categoryFilter, styleFilter, fontPairs]);

  const loadGoogleFont = (fontFamily: string) => {
    if (loadedFonts.has(fontFamily)) return;

    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@300;400;600;700&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    setLoadedFonts(prev => new Set([...prev, fontFamily]));
  };

  const toggleFavorite = (pairId: string) => {
    setFavorites(prev => 
      prev.includes(pairId) 
        ? prev.filter(id => id !== pairId)
        : [...prev, pairId]
    );
  };

  const copyFontPair = async (pair: FontPair) => {
    const cssCode = `/* Google Fonts Import */
@import url('https://fonts.googleapis.com/css2?family=${pair.primary.family.replace(/\s+/g, '+')}:wght@${pair.primary.weights.join(';')}&family=${pair.secondary.family.replace(/\s+/g, '+')}:wght@${pair.secondary.weights.join(';')}&display=swap');

/* CSS Font Declarations */
.heading {
  font-family: '${pair.primary.family}', ${pair.primary.category};
  font-weight: ${pair.primary.weights.includes('700') ? '700' : pair.primary.weights[0]};
}

.body-text {
  font-family: '${pair.secondary.family}', ${pair.secondary.category};
  font-weight: ${pair.secondary.weights.includes('400') ? '400' : pair.secondary.weights[0]};
}`;

    try {
      await navigator.clipboard.writeText(cssCode);
      toast({
        title: "CSS Copied!",
        description: "Font pair CSS has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const generateRandomPairs = () => {
    const shuffled = [...popularFontPairs].sort(() => Math.random() - 0.5);
    setFilteredPairs(shuffled);
    toast({
      title: "Fonts Shuffled!",
      description: "Showing random font pair combinations.",
    });
  };

  const openGoogleFonts = (fontName: string) => {
    window.open(`https://fonts.google.com/specimen/${fontName.replace(/\s+/g, '+')}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-6 w-6 text-blue-600" />
            Google Fonts Pair Finder
          </CardTitle>
          <p className="text-gray-600">
            Discover perfect Google Font combinations for your projects. Find harmonious font pairs that work beautifully together.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search fonts or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={styleFilter} onValueChange={setStyleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Style" />
              </SelectTrigger>
              <SelectContent>
                {styles.map(style => (
                  <SelectItem key={style} value={style}>
                    {style === 'all' ? 'All Styles' : style.charAt(0).toUpperCase() + style.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={generateRandomPairs} variant="outline" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Shuffle
            </Button>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredPairs.length} font pair{filteredPairs.length !== 1 ? 's' : ''}
            </p>
            <div className="flex gap-2">
              <Badge variant="outline">{favorites.length} Favorites</Badge>
            </div>
          </div>

          {/* Font Pairs Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPairs.map(pair => (
                <Card key={pair.id} className="border-2 hover:border-blue-200 transition-colors">
                  <CardContent className="p-6 space-y-4">
                    {/* Header with actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {pair.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => toggleFavorite(pair.id)}
                          variant="ghost"
                          size="sm"
                          className={favorites.includes(pair.id) ? 'text-red-500' : 'text-gray-400'}
                        >
                          <Heart className={`h-4 w-4 ${favorites.includes(pair.id) ? 'fill-current' : ''}`} />
                        </Button>
                        <Button onClick={() => copyFontPair(pair)} variant="ghost" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Font Preview */}
                    <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                      <div 
                        className="text-2xl font-bold text-gray-800"
                        style={{ fontFamily: `'${pair.primary.family}', ${pair.primary.category}` }}
                      >
                        The quick brown fox jumps
                      </div>
                      <div 
                        className="text-base text-gray-600 leading-relaxed"
                        style={{ fontFamily: `'${pair.secondary.family}', ${pair.secondary.category}` }}
                      >
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.
                      </div>
                    </div>

                    {/* Font Details */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Heading Font</Label>
                          <Button
                            onClick={() => openGoogleFonts(pair.primary.name)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600">{pair.primary.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{pair.primary.category}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Body Font</Label>
                          <Button
                            onClick={() => openGoogleFonts(pair.secondary.name)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600">{pair.secondary.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{pair.secondary.category}</p>
                      </div>
                    </div>

                    {/* Popularity Score */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs text-gray-500">Popularity Score</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 transition-all"
                            style={{ width: `${pair.popularity}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">{pair.popularity}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
            ))}
          </div>

          {filteredPairs.length === 0 && (
            <div className="text-center py-12">
              <Type className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No font pairs found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
            </div>
          )}

          {/* Info Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
            <h3 className="font-semibold text-blue-800 mb-2">💡 Font Pairing Tips</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• <strong>Contrast is key:</strong> Pair serif headings with sans-serif body text or vice versa</li>
              <li>• <strong>Maintain hierarchy:</strong> Use different weights and sizes to create clear typography hierarchy</li>
              <li>• <strong>Test readability:</strong> Ensure your font combinations are readable across different devices</li>
              <li>• <strong>Consider your brand:</strong> Choose fonts that align with your project's personality and goals</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleFontsPairFinder;
