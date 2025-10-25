import React, { useState } from 'react';
import { X, Search, UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext_new';
import { getUserByEmail, addContact } from '../services/firestoreService';

const AddContactModal = ({ isOpen, onClose, onContactAdded }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundUser, setFoundUser] = useState(null);
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSearch = async () => {
    if (!email.trim()) return;

    setIsSearching(true);
    setError('');
    setFoundUser(null);

    try {
      const userData = await getUserByEmail(email.trim());
      if (userData) {
        if (userData.uid === user.uid) {
          setError('You cannot add yourself as a contact');
        } else {
          setFoundUser(userData);
          setCustomName(userData.displayName);
        }
      } else {
        setError('User not found with this email');
      }
    } catch (err) {
      setError('Error searching for user');
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddContact = async () => {
    if (!foundUser) return;

    setIsAdding(true);
    try {
      await addContact(user.uid, foundUser.uid, customName.trim() || null);
      // Show success message briefly before closing
      setError('');
      // Close modal after successful addition
      setTimeout(() => {
        onContactAdded && onContactAdded();
        handleClose();
      }, 500);
    } catch (err) {
      if (err.message === 'Contact already exists') {
        setError('Contact already exists');
      } else {
        setError('Error adding contact');
      }
      console.error('Add contact error:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setCustomName('');
    setFoundUser(null);
    setError('');
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isSearching) {
      handleSearch();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`sm:max-w-md ${
        theme === 'dark' ? 'bg-[#111B21] border-[#2A3942]' : 'bg-white'
      }`}>
        <DialogHeader>
          <DialogTitle className={`${
            theme === 'dark' ? 'text-[#E9EDEF]' : 'text-[#111B21]'
          }`}>
            Add New Contact
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email Search */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-[#E9EDEF]' : 'text-[#111B21]'
            }`}>
              Search by Email
            </label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className={`flex-1 ${
                  theme === 'dark'
                    ? 'bg-[#202C33] border-[#2A3942] text-[#E9EDEF] placeholder-[#667781]'
                    : 'bg-white border-gray-300'
                }`}
              />
              <Button
                onClick={handleSearch}
                disabled={isSearching || !email.trim()}
                className="px-3"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Found User Display */}
          {foundUser && (
            <div className={`p-3 rounded-lg ${
              theme === 'dark' ? 'bg-[#202C33]' : 'bg-gray-50'
            }`}>
              <div className="flex items-center gap-3">
                <img
                  src={foundUser.photoURL}
                  alt={foundUser.displayName}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <p className={`font-medium ${
                    theme === 'dark' ? 'text-[#E9EDEF]' : 'text-[#111B21]'
                  }`}>
                    {foundUser.displayName}
                  </p>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-[#667781]' : 'text-gray-600'
                  }`}>
                    {foundUser.email}
                  </p>
                </div>
              </div>

              {/* Custom Name Input */}
              <div className="mt-3">
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-[#E9EDEF]' : 'text-[#111B21]'
                }`}>
                  Custom Name (optional)
                </label>
                <Input
                  placeholder="Enter custom name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className={`${
                    theme === 'dark'
                      ? 'bg-[#2A3942] border-[#2A3942] text-[#E9EDEF] placeholder-[#667781]'
                      : 'bg-white border-gray-300'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className={`${
                theme === 'dark'
                  ? 'border-[#2A3942] text-[#E9EDEF] hover:bg-[#202C33]'
                  : ''
              }`}
            >
              Cancel
            </Button>
            {foundUser && (
              <Button
                onClick={handleAddContact}
                disabled={isAdding}
                className="bg-[#25D366] hover:bg-[#128C7E] text-white"
              >
                {isAdding ? (
                  'Adding...'
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Contact
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddContactModal;
