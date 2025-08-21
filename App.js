import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Switch,
  Dimensions,
  Alert,
  ScrollView,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

export default function NotesApp() {
  const [notes, setNotes] = useState([
    { 
      id: "1", 
      title: "The Benefits of Meditation", 
      content: "Meditation is a practice that offers numerous benefits...", 
      tags: ["Wellness", "Health"], 
      category: "Personal",
      pinned: false,
      archived: false
    },
    { 
      id: "2", 
      title: "The Importance of Goals", 
      content: "Setting goals is key to achieving success in any area of life...", 
      tags: ["Productivity", "Success"], 
      category: "Work",
      pinned: true,
      archived: false
    },
    { 
      id: "3", 
      title: "The History of Coffee", 
      content: "Coffee is one of the most popular beverages worldwide with a rich history...", 
      tags: ["History", "Food"], 
      category: "Research",
      pinned: false,
      archived: false
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteTags, setNewNoteTags] = useState("");
  const [newNoteCategory, setNewNoteCategory] = useState("Personal");
  const [darkMode, setDarkMode] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTags, setSelectedTags] = useState([]);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [archivedNotes, setArchivedNotes] = useState(false);

  // Available categories and tags
  const categories = ["All", "Personal", "Work", "Research", "Ideas"];
  const allTags = ["Wellness", "Health", "Productivity", "Success", "History", "Food", "Urgent", "Important"];

  // Filter notes based on search, category, tags, and archive status
  const filteredNotes = notes.filter((note) => {
    if (note.archived !== archivedNotes) return false;
    
    const matchesSearch = 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "All" || note.category === selectedCategory;
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => note.tags.includes(tag));
    
    return matchesSearch && matchesCategory && matchesTags;
  });

  // Sort notes: pinned first, then by title
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return a.title.localeCompare(b.title);
  });

  // Handle adding a new note
  const handleAddNote = () => {
    if (newNoteTitle.trim()) {
      const newNote = {
        id: Date.now().toString(),
        title: newNoteTitle,
        content: newNoteContent,
        tags: newNoteTags.split(',').map(tag => tag.trim()).filter(tag => tag),
        category: newNoteCategory,
        pinned: false,
        archived: false
      };
      setNotes([newNote, ...notes]);
      resetModal();
    }
  };

  // Handle updating an existing note
  const handleUpdateNote = () => {
    if (newNoteTitle.trim()) {
      setNotes(notes.map(note => 
        note.id === editingNoteId 
          ? { 
              ...note, 
              title: newNoteTitle, 
              content: newNoteContent,
              tags: newNoteTags.split(',').map(tag => tag.trim()).filter(tag => tag),
              category: newNoteCategory
            } 
          : note
      ));
      resetModal();
    }
  };

  // Handle deleting a note with confirmation
  const handleDeleteNote = (id) => {
    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this note?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            setNotes(notes.filter(note => note.id !== id));
          }
        }
      ]
    );
  };

  // Toggle pin status of a note
  const togglePinNote = (id) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, pinned: !note.pinned } : note
    ));
  };

  // Toggle archive status of a note
  const toggleArchiveNote = (id) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, archived: !note.archived } : note
    ));
  };

  // Open edit modal with note data
  const openEditModal = (note) => {
    setNewNoteTitle(note.title);
    setNewNoteContent(note.content);
    setNewNoteTags(note.tags.join(', '));
    setNewNoteCategory(note.category);
    setIsEditMode(true);
    setEditingNoteId(note.id);
    setModalVisible(true);
  };

  // Reset modal state
  const resetModal = () => {
    setModalVisible(false);
    setIsEditMode(false);
    setEditingNoteId(null);
    setNewNoteTitle("");
    setNewNoteContent("");
    setNewNoteTags("");
    setNewNoteCategory("Personal");
  };

  // Toggle tag selection for filtering
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Render note item with swipe actions
  const renderNoteItem = ({ item }) => (
    <View style={styles.noteItemContainer}>
      <TouchableOpacity 
        style={[styles.noteCard, darkMode ? styles.darkNoteCard : styles.lightNoteCard]}
        onPress={() => openEditModal(item)}
        onLongPress={() => handleDeleteNote(item.id)}
      >
        <View style={styles.noteHeader}>
          <Text style={[styles.noteTitle, darkMode ? styles.darkText : styles.lightText]}>
            {item.title}
          </Text>
          <TouchableOpacity onPress={() => togglePinNote(item.id)}>
            <Ionicons 
              name={item.pinned ? "pin" : "pin-outline"} 
              size={20} 
              color={darkMode ? "#f57c00" : "#f57c00"} 
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.noteContentPreview}>
          <Text style={[styles.noteContent, darkMode ? styles.darkSecondaryText : styles.lightSecondaryText]}>
            {item.content.substring(0, 60)}...
          </Text>
        </View>
        
        <View style={styles.tagsContainer}>
          <Text style={[styles.categoryText, darkMode ? styles.darkSecondaryText : styles.lightSecondaryText]}>
            {item.category}
          </Text>
          {item.tags.map((tag, index) => (
            <View key={index} style={[styles.tag, darkMode ? styles.darkTag : styles.lightTag]}>
              <Text style={[styles.tagText, darkMode ? styles.darkTagText : styles.lightTagText]}>
                {tag}
              </Text>
            </View>
          ))}
        </View>
        
        <View style={styles.noteActions}>
          <TouchableOpacity onPress={() => toggleArchiveNote(item.id)}>
            <Ionicons 
              name={item.archived ? "archive" : "archive-outline"} 
              size={20} 
              color={darkMode ? "#aaa" : "#555"} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteNote(item.id)}>
            <Ionicons 
              name="trash-outline" 
              size={20} 
              color={darkMode ? "#aaa" : "#555"} 
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );

  const appStyles = darkMode ? styles.dark : styles.light;

  return (
    <SafeAreaView style={[styles.container, appStyles.container]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setIsSearching(!isSearching)}>
          <Ionicons
            name="search"
            size={24}
            color={darkMode ? "white" : "black"}
          />
        </TouchableOpacity>
        
        <Text style={[styles.heading, appStyles.heading]}>
          {archivedNotes ? "Archived Notes" : "Notes"}
        </Text>
        
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => setArchivedNotes(!archivedNotes)} style={styles.headerButton}>
            <Ionicons
              name={archivedNotes ? "folder-open" : "archive-outline"}
              size={24}
              color={darkMode ? "white" : "black"}
            />
          </TouchableOpacity>
          <Switch
            value={darkMode}
            onValueChange={() => setDarkMode(!darkMode)}
            thumbColor={darkMode ? "#f57c00" : "#aaa"}
            trackColor={{ true: "#444", false: "#ddd" }}
          />
        </View>
      </View>

      {/* Search Bar */}
      {isSearching && (
        <View style={styles.searchContainer}>
          <TextInput
            style={[styles.searchBar, appStyles.searchBar]}
            placeholder="Search notes, tags, or content"
            placeholderTextColor={darkMode ? "#aaa" : "#555"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowCategoriesModal(true)}
          >
            <Ionicons
              name="filter"
              size={20}
              color={darkMode ? "white" : "black"}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Filter Bar */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterScrollView}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedCategory === "All" ? styles.activeFilterChip : {},
            darkMode ? styles.darkFilterChip : styles.lightFilterChip
          ]}
          onPress={() => setSelectedCategory("All")}
        >
          <Text style={[
            styles.filterChipText,
            darkMode ? styles.darkText : styles.lightText,
            selectedCategory === "All" ? styles.activeFilterChipText : {}
          ]}>
            All
          </Text>
        </TouchableOpacity>
        
        {categories.filter(cat => cat !== "All").map((category, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.filterChip,
              selectedCategory === category ? styles.activeFilterChip : {},
              darkMode ? styles.darkFilterChip : styles.lightFilterChip
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.filterChipText,
              darkMode ? styles.darkText : styles.lightText,
              selectedCategory === category ? styles.activeFilterChipText : {}
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity
          style={[
            styles.filterChip,
            darkMode ? styles.darkFilterChip : styles.lightFilterChip
          ]}
          onPress={() => setShowTagsModal(true)}
        >
          <Text style={[
            styles.filterChipText,
            darkMode ? styles.darkText : styles.lightText
          ]}>
            Tags: {selectedTags.length > 0 ? selectedTags.join(', ') : 'All'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Notes List */}
      <FlatList
        data={sortedNotes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.notesList}
        ListEmptyComponent={
          <View style={styles.notFoundContainer}>
            <Text style={[styles.notFoundText, appStyles.notFoundText]}>
              No notes found
            </Text>
          </View>
        }
        renderItem={renderNoteItem}
      />

      {/* Floating Action Button */}
      {!archivedNotes && (
        <TouchableOpacity
          style={[styles.fab, appStyles.fab]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      )}

      {/* Modal for Adding/Editing Notes */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={resetModal}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, appStyles.modalContent]}>
            <Text style={[styles.modalTitle, appStyles.modalTitle]}>
              {isEditMode ? "Edit Note" : "Add New Note"}
            </Text>
            
            <TextInput
              style={[styles.input, appStyles.input]}
              placeholder="Title"
              placeholderTextColor={darkMode ? "#aaa" : "#555"}
              value={newNoteTitle}
              onChangeText={setNewNoteTitle}
            />
            
            <TextInput
              style={[
                styles.input, 
                appStyles.input,
                { height: 100, textAlignVertical: 'top' }
              ]}
              placeholder="Content"
              placeholderTextColor={darkMode ? "#aaa" : "#555"}
              value={newNoteContent}
              onChangeText={setNewNoteContent}
              multiline
            />
            
            <TextInput
              style={[styles.input, appStyles.input]}
              placeholder="Tags (comma separated)"
              placeholderTextColor={darkMode ? "#aaa" : "#555"}
              value={newNoteTags}
              onChangeText={setNewNoteTags}
            />
            
            <Text style={[styles.label, darkMode ? styles.darkText : styles.lightText]}>
              Category:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScrollView}>
              {categories.filter(cat => cat !== "All").map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.categoryOption,
                    newNoteCategory === category ? styles.activeCategoryOption : {},
                    darkMode ? styles.darkCategoryOption : styles.lightCategoryOption
                  ]}
                  onPress={() => setNewNoteCategory(category)}
                >
                  <Text style={[
                    styles.categoryOptionText,
                    darkMode ? styles.darkText : styles.lightText,
                    newNoteCategory === category ? styles.activeCategoryOptionText : {}
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#f57c00" }]}
                onPress={isEditMode ? handleUpdateNote : handleAddNote}
              >
                <Text style={styles.buttonText}>{isEditMode ? "Update" : "Add"}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#333" }]}
                onPress={resetModal}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Category Filter Modal */}
      <Modal
        visible={showCategoriesModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCategoriesModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setShowCategoriesModal(false)}
        >
          <View style={[styles.filterModal, darkMode ? styles.darkModal : styles.lightModal]}>
            <Text style={[styles.filterModalTitle, darkMode ? styles.darkText : styles.lightText]}>
              Select Category
            </Text>
            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={styles.filterModalOption}
                onPress={() => {
                  setSelectedCategory(category);
                  setShowCategoriesModal(false);
                }}
              >
                <Text style={[styles.filterModalOptionText, darkMode ? styles.darkText : styles.lightText]}>
                  {category}
                </Text>
                {selectedCategory === category && (
                  <Ionicons name="checkmark" size={20} color="#f57c00" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Tags Filter Modal */}
      <Modal
        visible={showTagsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTagsModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setShowTagsModal(false)}
        >
          <View style={[styles.filterModal, darkMode ? styles.darkModal : styles.lightModal]}>
            <Text style={[styles.filterModalTitle, darkMode ? styles.darkText : styles.lightText]}>
              Select Tags
            </Text>
            {allTags.map((tag, index) => (
              <TouchableOpacity
                key={index}
                style={styles.filterModalOption}
                onPress={() => toggleTag(tag)}
              >
                <Text style={[styles.filterModalOptionText, darkMode ? styles.darkText : styles.lightText]}>
                  {tag}
                </Text>
                {selectedTags.includes(tag) && (
                  <Ionicons name="checkmark" size={20} color="#f57c00" />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.modalButton, { marginTop: 10, backgroundColor: "#f57c00" }]}
              onPress={() => setShowTagsModal(false)}
            >
              <Text style={styles.buttonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 10,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    marginRight: 15,
  },
  heading: {
    fontSize: 30,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
  },
  searchBar: {
    flex: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginRight: 10,
  },
  filterButton: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: "#f57c00",
  },
  filterScrollView: {
    marginHorizontal: 10,
    marginBottom: 10,
    maxHeight: 40,
  },
  filterChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,

  },
  activeFilterChip: {
    backgroundColor: "#f57c00",
  },
  filterChipText: {
    fontSize: 14,
  },
  activeFilterChipText: {
    color: "white",
    fontWeight: "bold",
  },
  notesList: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  noteItemContainer: {
    marginTop: 14,
  },
  noteCard: {
    padding: 15,
    borderRadius: 10,
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  noteTitle: {
    color: "orange",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    marginRight: 10,
  },
  noteContentPreview: {
    marginBottom: 10,
  },
  noteContent: {
    fontSize: 14,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 10,
  },
  categoryText: {
    marginRight: 10,
    fontSize: 12,
    fontWeight: "bold",
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
  },
  noteActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 15,
  },
  notFoundContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  notFoundText: {
    fontSize: 18,
    fontStyle: "italic",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 50,
    shadowColor: "#000000ff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },
  input: {
    marginBottom: 15,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  categoryScrollView: {
    marginBottom: 15,
    maxHeight: 40,
  },
  categoryOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  activeCategoryOption: {
    backgroundColor: "#f57c00",
    borderColor: "#f57c00",
    borderWidth: 2,
  },
  activeCategoryOptionText: {
    color: "#ffffffff",
    fontWeight: "bold",
  },
  categoryOptionText: {
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    width: width * 0.35,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  filterModal: {
    width: width * 0.7,
    borderRadius: 10,
    padding: 20,
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  filterModalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filterModalOptionText: {
    fontSize: 16,
  },
  light: {
    container: { backgroundColor: "#f9f9f9" },
    heading: { color: "black" },
    searchBar: { backgroundColor: "#e0e0e0", color: "black" },
    noteCard: { backgroundColor: "#fff", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41, elevation: 2 },
    text: { color: "black" },
    secondaryText: { color: "#555" },
    modalContent: { backgroundColor: "#fff" },
    modalTitle: { color: "black" },
    input: { backgroundColor: "#f0f0f0", color: "black" },
    fab: { backgroundColor: "#f57c00" },
    filterChip: { backgroundColor: "#e0e0e0" },
    categoryOption: { backgroundColor: "#e0e0e0" },
    modal: { backgroundColor: "#fff" },
    tag: { backgroundColor: "#e0e0e0" },
    tagText: { color: "#333" },
  },
  dark: {
    container: { backgroundColor: "#1e1e1e" },
    heading: { color: "white" },
    searchBar: { backgroundColor: "#333", color: "white" },
    noteCard: { backgroundColor: "#2a2a2a", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
    text: { color: "white" },
    secondaryText: { color: "#aaa" },
    modalContent: { backgroundColor: "#333" },
    modalTitle: { color: "white" },
    input: { backgroundColor: "#444", color: "white" },
    fab: { backgroundColor: "#f57c00" },
    filterChip: { backgroundColor: "#333" },
    categoryOption: { backgroundColor: "#333" },
    modal: { backgroundColor: "#2a2a2a" },
    tag: { backgroundColor: "#333" },
    tagText: { color: "#fff" },
  },
  lightNoteCard: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  darkNoteCard: {
    backgroundColor: "#2a2a2a",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lightText: {
    color: "black",
  },
  darkText: {
    color: "white",
  },
  lightSecondaryText: {
    color: "#555",
  },
  darkSecondaryText: {
    color: "#aaa",
  },
  lightFilterChip: {
    backgroundColor: "#e0e0e0",
  },
  darkFilterChip: {
    backgroundColor: "#333",
  },
  lightCategoryOption: {
    backgroundColor: "#e0e0e0",
  },
  darkCategoryOption: {
    backgroundColor: "#333",
  },
  lightModal: {
    backgroundColor: "#fff",
  },
  darkModal: {
    backgroundColor: "#2a2a2a",
  },
  lightTag: {
    backgroundColor: "#e0e0e0",
  },
  darkTag: {
    backgroundColor: "#333",
  },
  lightTagText: {
    color: "#333",
  },
  darkTagText: {
    color: "#fff",
  },
});
