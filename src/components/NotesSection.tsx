import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface NotesSectionProps {
  isVisible: boolean;
}

export const NotesSection: React.FC<NotesSectionProps> = ({ isVisible }) => {
  const { theme } = useTheme();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Carregar notas do AsyncStorage (simulado por enquanto)
  useEffect(() => {
    // Aqui você pode carregar notas do AsyncStorage
    const loadNotes = async () => {
      // Simular algumas notas de exemplo
      const sampleNotes: Note[] = [
        {
          id: '1',
          title: 'Lembretes importantes',
          content: 'Não esquecer de tomar os medicamentos às 9h e 18h',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          title: 'Ideias para o projeto',
          content: 'Implementar sistema de notificações mais avançado',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      setNotes(sampleNotes);
    };

    if (isVisible) {
      loadNotes();
    }
  }, [isVisible]);

  const addNote = () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) {
      Alert.alert('Erro', 'Título e conteúdo são obrigatórios');
      return;
    }

    const newNote: Note = {
      id: Date.now().toString(),
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setNotes([newNote, ...notes]);
    setNewNoteTitle('');
    setNewNoteContent('');
    setIsAddingNote(false);
  };

  const editNote = (note: Note) => {
    setEditingNote(note);
    setNewNoteTitle(note.title);
    setNewNoteContent(note.content);
    setIsAddingNote(true);
  };

  const updateNote = () => {
    if (!editingNote || !newNoteTitle.trim() || !newNoteContent.trim()) {
      Alert.alert('Erro', 'Título e conteúdo são obrigatórios');
      return;
    }

    const updatedNotes = notes.map(note =>
      note.id === editingNote.id
        ? {
            ...note,
            title: newNoteTitle.trim(),
            content: newNoteContent.trim(),
            updatedAt: new Date(),
          }
        : note
    );

    setNotes(updatedNotes);
    setNewNoteTitle('');
    setNewNoteContent('');
    setIsAddingNote(false);
    setEditingNote(null);
  };

  const deleteNote = (noteId: string) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir esta nota?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            setNotes(notes.filter(note => note.id !== noteId));
          },
        },
      ]
    );
  };

  const cancelEdit = () => {
    setNewNoteTitle('');
    setNewNoteContent('');
    setIsAddingNote(false);
    setEditingNote(null);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text.primary }]}>
          📝 Bloco de Notas
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.action.primary }]}
          onPress={() => setIsAddingNote(true)}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {isAddingNote && (
        <View style={[styles.noteForm, { backgroundColor: theme.background.card }]}>
          <TextInput
            style={[styles.titleInput, { color: theme.text.primary, borderColor: theme.text.muted }]}
            placeholder="Título da nota"
            placeholderTextColor={theme.text.placeholder}
            value={newNoteTitle}
            onChangeText={setNewNoteTitle}
            maxLength={50}
          />
                     <TextInput
             style={[styles.contentInput, { color: theme.text.primary, borderColor: theme.text.muted }]}
             placeholder="Conteúdo da nota..."
             placeholderTextColor={theme.text.placeholder}
             value={newNoteContent}
             onChangeText={setNewNoteContent}
             multiline
             numberOfLines={4}
             maxLength={500}
           />
           <View style={styles.formActions}>
             <TouchableOpacity
               style={[styles.cancelButton, { backgroundColor: theme.action.logout }]}
               onPress={cancelEdit}
             >
               <Text style={styles.buttonText}>Cancelar</Text>
             </TouchableOpacity>
             <TouchableOpacity
               style={[styles.saveButton, { backgroundColor: theme.action.success }]}
               onPress={editingNote ? updateNote : addNote}
             >
               <Text style={styles.buttonText}>
                 {editingNote ? 'Atualizar' : 'Salvar'}
               </Text>
             </TouchableOpacity>
           </View>
        </View>
      )}

      <ScrollView style={styles.notesList} showsVerticalScrollIndicator={false}>
        {notes.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: theme.background.card }]}>
            <Ionicons name="document-text-outline" size={48} color={theme.text.muted} />
            <Text style={[styles.emptyStateText, { color: theme.text.muted }]}>
              Nenhuma nota ainda
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: theme.text.placeholder }]}>
              Crie sua primeira nota para começar
            </Text>
          </View>
        ) : (
          notes.map((note) => (
            <View key={note.id} style={[styles.noteItem, { backgroundColor: theme.background.card }]}>
              <View style={styles.noteHeader}>
                <Text style={[styles.noteTitle, { color: theme.text.primary }]}>
                  {note.title}
                </Text>
                <View style={styles.noteActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => editNote(note)}
                  >
                    <Ionicons name="pencil" size={16} color={theme.action.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => deleteNote(note.id)}
                  >
                    <Ionicons name="trash" size={16} color={theme.action.logout} />
                  </TouchableOpacity>
                </View>
              </View>
                             <Text style={[styles.noteContent, { color: theme.text.secondary }]}>
                 {note.content}
               </Text>
               <Text style={[styles.noteDate, { color: theme.text.muted }]}>
                 {formatDate(note.updatedAt)}
               </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  noteForm: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  titleInput: {
    fontSize: 16,
    fontWeight: '600',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  contentInput: {
    fontSize: 14,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  notesList: {
    flex: 1,
  },
  emptyState: {
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  noteItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  noteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  noteContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    fontStyle: 'italic',
  },

}); 