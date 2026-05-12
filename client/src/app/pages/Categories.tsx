import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Tag, Plus, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export function Categories() {
  const { user, events } = useApp();
  const navigate = useNavigate();
  const [newCategory, setNewCategory] = useState('');

  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  const categories = ['Academic', 'Social', 'Career', 'Club', 'Workshop', 'Other'];

  const getCategoryCount = (category: string) => {
    return events.filter((e) => e.category === category).length;
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      alert(`Category "${newCategory}" added successfully!`);
      setNewCategory('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F0F3F9] py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#1B2E55] mb-2 flex items-center gap-3">
              <Tag className="h-10 w-10 text-[#EF9B28]" />
              Manage Categories
            </h1>
            <p className="text-muted-foreground">Organize and manage event categories</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Add New Category */}
            <Card className="border-2 md:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg text-[#1B2E55]">Add New Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="category">Category Name</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Sports"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full bg-[#EF9B28] hover:bg-[#EF9B28]/90"
                  onClick={handleAddCategory}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </CardContent>
            </Card>

            {/* Existing Categories */}
            <Card className="border-2 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg text-[#1B2E55]">Existing Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div
                      key={category}
                      className="flex items-center justify-between p-4 bg-[#F0F3F9] rounded-lg hover:bg-[#EF9B28]/10 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-[#1B2E55] rounded-lg flex items-center justify-center">
                          <Tag className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#1B2E55]">{category}</p>
                          <p className="text-sm text-muted-foreground">
                            {getCategoryCount(category)} events
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{getCategoryCount(category)}</Badge>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Analytics */}
          <Card className="mt-6 border-2">
            <CardHeader>
              <CardTitle className="text-lg text-[#1B2E55]">Category Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map((category) => {
                  const count = getCategoryCount(category);
                  const percentage = events.length > 0 ? (count / events.length) * 100 : 0;
                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-[#1B2E55]">{category}</span>
                        <span className="text-sm text-muted-foreground">
                          {count} events ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-[#1B2E55] to-[#EF9B28] h-3 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

