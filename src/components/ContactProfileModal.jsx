import React, { useState, useEffect } from 'react';
import { X, Edit2, Save, User, Phone, Mail, MessageCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext_new';
import { getUserById, updateContactName, updateUserProfile } from '../services/firestoreService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const ContactProfileModal = ({ isOpen, onClose, contactId, contactData }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [contact, setContact] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [customName, setCustomName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && contactId) {
      loadContact();
    }
  }, [isOpen, contactId]);

  const loadContact = async () => {
    try {
      const contactInfo = await getUserById(contactId);
      setContact(contactInfo);
      setCustomName(contactData?.customName || contactInfo?.displayName || '');
      setBio(contactInfo?.bio || '');
    } catch (error) {
      console.error('Error loading contact:', error);
    }
  };

  const handleSaveName = async () => {
    if (!contactData?.id) return;

    setLoading(true);
    try {
      await updateContactName(contactData.id, customName.trim() || null);
      setIsEditingName(false);
      // Update local state immediately for better UX
      setContact(prev => prev ? { ...prev, displayName: customName.trim() || prev.displayName } : prev);
      // Also refresh from server to ensure consistency
      await loadContact();
      // Trigger parent component to refresh contact data
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('contactNameUpdated', {
          detail: { contactId, customName: customName.trim() }
        }));
      }
    } catch (error) {
      console.error('Error updating contact name:', error);
      alert('Gagal menyimpan nama kontak. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBio = async () => {
    if (!contactId) return;

    setLoading(true);
    try {
      await updateUserProfile(contactId, { bio: bio.trim() || null });
      setIsEditingBio(false);
      // Update local state immediately for better UX
      setContact(prev => prev ? { ...prev, bio: bio.trim() || null } : prev);
      // Also refresh from server to ensure consistency
      await loadContact();
    } catch (error) {
      console.error('Error updating bio:', error);
      alert('Gagal menyimpan bio. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const isOwnProfile = user?.uid === contactId;

  if (!contact) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-md max-h-[80vh] overflow-y-auto ${
        theme === 'dark'
          ? 'bg-[#202C33] text-[#E9EDEF] border-[#2A3942]'
          : 'bg-white text-[#111B21]'
      }`}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Info Kontak</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Avatar */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={contact.photoURL} alt={contact.displayName} />
              <AvatarFallback className="text-2xl">
                {contact.displayName[0]}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Name Section */}
          <div className="space-y-2">
            <label className={`text-sm font-medium ${
              theme === 'dark' ? 'text-[#8696A0]' : 'text-gray-600'
            }`}>
              Nama
            </label>
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <>
                  <Input
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className={`flex-1 ${
                      theme === 'dark'
                        ? 'bg-[#2A3942] text-[#E9EDEF] border-[#667781]'
                        : 'bg-white text-black'
                    }`}
                    placeholder="Masukkan nama kontak"
                  />
                  <Button
                    onClick={handleSaveName}
                    disabled={loading}
                    size="sm"
                    className="px-3"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditingName(false);
                      setCustomName(contactData?.customName || contact?.displayName || '');
                    }}
                    variant="outline"
                    size="sm"
                    className="px-3"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <span className={`flex-1 text-lg ${
                    theme === 'dark' ? 'text-[#E9EDEF]' : 'text-[#111B21]'
                  }`}>
                    {customName || contact.displayName}
                  </span>
                  {!isOwnProfile && (
                    <Button
                      onClick={() => setIsEditingName(true)}
                      variant="ghost"
                      size="sm"
                      className="px-3"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Bio Section */}
          {(isOwnProfile || contact.bio) && (
            <div className="space-y-2">
              <label className={`text-sm font-medium ${
                theme === 'dark' ? 'text-[#8696A0]' : 'text-gray-600'
              }`}>
                Bio
              </label>
              <div className="flex items-start gap-2">
                {isEditingBio && isOwnProfile ? (
                  <>
                    <Input
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className={`flex-1 ${
                        theme === 'dark'
                          ? 'bg-[#2A3942] text-[#E9EDEF] border-[#667781]'
                          : 'bg-white text-black'
                      }`}
                      placeholder="Masukkan bio Anda"
                    />
                    <Button
                      onClick={handleSaveBio}
                      disabled={loading}
                      size="sm"
                      className="px-3 mt-1"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditingBio(false);
                        setBio(contact?.bio || '');
                      }}
                      variant="outline"
                      size="sm"
                      className="px-3 mt-1"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span className={`flex-1 ${
                      theme === 'dark' ? 'text-[#E9EDEF]' : 'text-[#111B21]'
                    }`}>
                      {contact.bio || (isOwnProfile ? 'Belum ada bio' : 'Tidak ada bio')}
                    </span>
                    {isOwnProfile && (
                      <Button
                        onClick={() => setIsEditingBio(true)}
                        variant="ghost"
                        size="sm"
                        className="px-3"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Contact Info */}
          <div className="space-y-3">
            {contact.phoneNumber && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-opacity-50">
                <Phone className={`h-5 w-5 ${
                  theme === 'dark' ? 'text-[#00A884]' : 'text-[#25D366]'
                }`} />
                <div>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-[#8696A0]' : 'text-gray-600'
                  }`}>
                    Telepon
                  </p>
                  <p className={`${
                    theme === 'dark' ? 'text-[#E9EDEF]' : 'text-[#111B21]'
                  }`}>
                    {contact.phoneNumber}
                  </p>
                </div>
              </div>
            )}

            {contact.email && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-opacity-50">
                <Mail className={`h-5 w-5 ${
                  theme === 'dark' ? 'text-[#00A884]' : 'text-[#25D366]'
                }`} />
                <div>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-[#8696A0]' : 'text-gray-600'
                  }`}>
                    Email
                  </p>
                  <p className={`${
                    theme === 'dark' ? 'text-[#E9EDEF]' : 'text-[#111B21]'
                  }`}>
                    {contact.email}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Tutup
            </Button>
            <Button
              className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Kirim Pesan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactProfileModal;
