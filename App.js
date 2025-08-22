import React, { useState, useRef } from "react";
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
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import AuthScreen from "./authScreen"; // Import the AuthScreen component

const { width, height } = Dimensions.get("window");
const Tab = createBottomTabNavigator();

// Main Notes Screen Component
function NotesScreen({ 
  notes, 
  setNotes, 
  darkMode, 
  setDarkMode,
  isModalVisible,
  setModalVisible,
  onLogout
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteTags, setNewNoteTags] = useState("");
  const [newNoteCategory, setNewNoteCategory] = useState("Personal");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTags, setSelectedTags] = useState([]);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showTagsModal, setShowTagsModal] = useState(false);

  // Available categories and tags
  const categories = ["All", "Personal", "Work", "Research", "Ideas"];
  const allTags = ["Wellness", "Health", "Productivity", "Success", "History", "Food", "Urgent", "Important"];

  // Filter notes based on search, category, tags, and deleted status
  const filteredNotes = notes.filter((note) => {
    if (note.deleted) return false;
    
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
        archived: false,
        deleted: false
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
            setNotes(notes.map(note => 
              note.id === id ? { ...note, deleted: true } : note
            ));
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
          Notes
        </Text>
        
        <View style={styles.headerRight}>
          <TouchableOpacity 
            onPress={onLogout} 
            style={styles.logoutButton}
          >
            <Ionicons
              name="log-out-outline"
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

// Deleted Notes Screen Component
function DeletedNotesScreen({ 
  notes, 
  setNotes, 
  darkMode, 
  setDarkMode,
  onLogout
}) {
  // Filter only deleted notes
  const deletedNotes = notes.filter(note => note.deleted);

  // Restore a deleted note
  const restoreNote = (id) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, deleted: false } : note
    ));
  };

  // Permanently delete a note
  const permanentDeleteNote = (id) => {
    Alert.alert(
      "Permanently Delete Note",
      "Are you sure you want to permanently delete this note? This action cannot be undone.",
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

  // Render deleted note item
  const renderDeletedNoteItem = ({ item }) => (
    <View style={styles.noteItemContainer}>
      <View style={[styles.noteCard, darkMode ? styles.darkNoteCard : styles.lightNoteCard]}>
        <View style={styles.noteHeader}>
          <Text style={[styles.noteTitle, darkMode ? styles.darkText : styles.lightText]}>
            {item.title}
          </Text>
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
          <TouchableOpacity onPress={() => restoreNote(item.id)}>
            <Ionicons 
              name="arrow-undo-outline" 
              size={20} 
              color={darkMode ? "#aaa" : "#555"} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => permanentDeleteNote(item.id)}>
            <Ionicons 
              name="trash-outline" 
              size={20} 
              color={darkMode ? "#ff3b30" : "#ff3b30"} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const appStyles = darkMode ? styles.dark : styles.light;

  return (
    <SafeAreaView style={[styles.container, appStyles.container]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.heading, appStyles.heading]}>
          Deleted Notes
        </Text>
        
        <View style={styles.headerRight}>
          <TouchableOpacity 
            onPress={onLogout} 
            style={styles.logoutButton}
          >
            <Ionicons
              name="log-out-outline"
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

      {/* Deleted Notes List */}
      <FlatList
        data={deletedNotes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.notesList}
        ListEmptyComponent={
          <View style={styles.notFoundContainer}>
            <Text style={[styles.notFoundText, appStyles.notFoundText]}>
              No deleted notes found
            </Text>
          </View>
        }
        renderItem={renderDeletedNoteItem}
      />
    </SafeAreaView>
  );
}

// Custom Tab Bar with Animated Add Button
function CustomTabBar({ state, descriptors, navigation, darkMode, onAddPress }) {
  const animation = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 180,
      useNativeDriver: false,
      easing: Easing.out(Easing.ease),
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 180,
      useNativeDriver: false,
      easing: Easing.out(Easing.ease),
    }).start();
  };

  const borderRadius = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 60],
  });

  const backgroundColor = darkMode ? "#333" : "#fff";
  const activeTintColor = "#f57c00";
  const inactiveTintColor = darkMode ? "#aaa" : "#888";
  const 
  tabBarStyle = {
    flexDirection: "row",
    height: 70,
    backgroundColor,
    borderTopWidth: 0,
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  };

  // Move renderTab OUTSIDE of JSX
  function renderTab(route, index) {
    const { options } = descriptors[route.key];
    const label =
      options.tabBarLabel !== undefined
        ? options.tabBarLabel
        : options.title !== undefined
        ? options.title
        : route.name;

    const isFocused = state.index === index;

    let iconName;
    if (route.name === "Notes") iconName = isFocused ? "document-text" : "document-text-outline";
    else if (route.name === "Deleted Notes") iconName = isFocused ? "trash" : "trash-outline";

    return (
      <TouchableOpacity
        key={route.key}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        testID={options.tabBarTestID}
        onPress={() => navigation.navigate(route.name)}
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 10,
        }}
        activeOpacity={0.7}
      >
        <Ionicons name={iconName} size={26} color={isFocused ? activeTintColor : inactiveTintColor} />
        <Text style={{ color: isFocused ? activeTintColor : inactiveTintColor, fontSize: 12, marginTop: 2 }}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={tabBarStyle}>
      {state.routes.map((route, index) => {
        // Place Add button between first and second tab
        if (index === 1) {
          return (
            <React.Fragment key="add-btn">
              <Animated.View
                style={{
                  marginHorizontal: 10,
                  borderRadius,
                  backgroundColor: activeTintColor,
                  width: 60,
                  height: 60,
                  justifyContent: "center",
                  alignItems: "center",
                  top: -20,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 8,
                }}
              >
                <TouchableOpacity
                  onPress={onAddPress}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  activeOpacity={0.8}
                  style={{ width: 60, height: 60, justifyContent: "center", alignItems: "center" }}
                >
                  <Ionicons name="add" size={32} color="#fff" />
                </TouchableOpacity>
              </Animated.View>
              {renderTab(route, index)}
            </React.Fragment>
          );
        }
        return renderTab(route, index);
      })}
    </View>
  );
}

// Main App Component with Tab Navigation
export default function NotesApp() {
  const [user, setUser] = useState(null); // Track user authentication
  const [notes, setNotes] = useState([
    { 
      id: "1", 
      title: "The Benefits of Meditation", 
      content: "Meditation is a practice that offers numerous benefits...", 
      tags: ["Wellness", "Health"], 
      category: "Personal",
      pinned: false,
      archived: false,
      deleted: false
    },
    { 
      id: "2", 
      title: "The Importance of Goals", 
      content: "Setting goals is key to achieving success in any area of life...", 
      tags: ["Productivity", "Success"], 
      category: "Work",
      pinned: true,
      archived: false,
      deleted: false
    },
    { 
      id: "3", 
      title: "The History of Coffee", 
      content: "Coffee is one of the most popular beverages worldwide with a rich history...", 
      tags: ["History", "Food"], 
      category: "Research",
      pinned: false,
      archived: false,
      deleted: false
    },
    { 
      id: "4", 
      title: "Deleted Note Example", 
      content: "This note has been deleted...", 
      tags: ["Example"], 
      category: "Personal",
      pinned: false,
      archived: false,
      deleted: true
    },
  ]);
  const [darkMode, setDarkMode] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);

  // Pass modal control to NotesScreen
  const handleAddPress = () => setModalVisible(true);

  // If user is not authenticated, show AuthScreen
  if (!user) {
    return (
      <SafeAreaProvider>
        <AuthScreen 
          setUser={setUser} 
          setDarkMode={setDarkMode} 
          darkMode={darkMode} 
        />
      </SafeAreaProvider>
    );
  }

  // If user is authenticated, show the main app
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          tabBar={(props) => (
            <CustomTabBar
              {...props}
              darkMode={darkMode}
              onAddPress={handleAddPress}
            />
          )}
          screenOptions={{
            headerShown: false,
          }}
        >
          <Tab.Screen name="Notes">
            {() => (
              <NotesScreen
                notes={notes}
                setNotes={setNotes}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                isModalVisible={isModalVisible}
                setModalVisible={setModalVisible}
                onLogout={() => setUser(null)}
              />
            )}
          </Tab.Screen>
          <Tab.Screen name="Deleted Notes">
            {() => (
              <DeletedNotesScreen
                notes={notes}
                setNotes={setNotes}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                onLogout={() => setUser(null)}
              />
            )}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

// Main App Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutButton: {
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
    marginBottom: 10,
  },
  searchBar: {
    flex: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginRight: 10,
    marginBottom: 14,
  },
  filterButton: {
    padding: 10,
    borderRadius: 10,
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
    marginBottom: 16,

  },
  noteCard: {
    padding: 15,
    borderRadius: 10,
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  noteTitle: {
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
    // backgroundColor: "#f57c00",
    borderColor: "#f57c00",
    borderWidth: 1.5,
  },
  activeCategoryOptionText: {
    color: "orange",
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
    borderBottomColor: "#ccc",

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
    searchBar: { backgroundColor: "#000000ff", color: "white" },
    noteCard: { backgroundColor: "#2a2a2a", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
    text: { color: "white" },
    secondaryText: { color: "#aaa" },
    modalContent: { backgroundColor: "#333" },
    modalTitle: { color: "white" },
    input: { backgroundColor: "#444", color: "white" },
    fab: { backgroundColor: "#f57c00" },
    filterChip: { backgroundColor: "#333" },
    categoryOption: { backgroundColor: "#000000ff" },
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
    backgroundColor: "#000000ff",
    shadowColor: "#2e2e2eff",
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
    color: "#000000ff",
  },
  darkTagText: {
    color: "#fff",
  },
});