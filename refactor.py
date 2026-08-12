import sys

def main():
    file_path = 'src/Pages/AlfilahaAdmin/AlfilahaAdmin.jsx'
    with open(file_path, 'r') as f:
        lines = f.readlines()

    imports = """import Beranda from './Tabs/Beranda/Beranda';
import KelolaArtikel from './Tabs/KelolaArtikel/KelolaArtikel';
import BlogGrid from './Tabs/BlogGrid/BlogGrid';
import Event from './Tabs/Event/Event';
import PaketWisata from './Tabs/PaketWisata/PaketWisata';
import Reservasi from './Tabs/Reservasi/Reservasi';
"""
    # Insert imports at line 4 (index 3)
    lines.insert(3, imports)

    # Note: because we inserted 1 block of text (which could be considered 1 element in the list), 
    # it's better to insert them as separate lines or just as one string.
    # The line numbers for replacement are 670 to 1134 in the ORIGINAL file.
    # So in the new list, it's 670+1 = 671 to 1134+1 = 1135.
    
    components = """            {activeTab === 'beranda' && <Beranda reservasi={reservasi} blogs={blogs} events={events} handleTabChange={handleTabChange} />}
            {activeTab === 'artikel' && <KelolaArtikel articles={articles} showToast={showToast} />}
            {activeTab === 'blogGrid' && <BlogGrid blogs={blogs} setAddBlogModal={setAddBlogModal} setEditBlogModal={setEditBlogModal} setDeleteBlogModal={setDeleteBlogModal} />}
            {activeTab === 'event' && <Event events={events} setAddEventModal={setAddEventModal} setEditEventModal={setEditEventModal} setDeleteEventModal={setDeleteEventModal} />}
            {activeTab === 'wisata' && <PaketWisata wisata={wisata} setAddWisataModal={setAddWisataModal} setEditWisataModal={setEditWisataModal} setDeletePaketModal={setDeletePaketModal} />}
            {activeTab === 'reservasi' && <Reservasi reservasi={reservasi} searchQuery={searchQuery} setSearchQuery={setSearchQuery} filterStatus={filterStatus} setFilterStatus={setFilterStatus} updateStatusReservasi={updateStatusReservasi} setRejectModal={setRejectModal} setDeleteModal={setDeleteModal} />}
"""

    # Replace from original line 670 to 1134
    # Index for 670 is 669. Because we inserted 1 element before, it's 670.
    # Index for 1134 is 1133. Because we inserted 1 element before, it's 1134.
    
    start_idx = 0
    end_idx = 0
    
    # We can just search for the markers to be safe
    for i, line in enumerate(lines):
        if "{/* TAB BERANDA */}" in line:
            start_idx = i
            break
            
    # Find the end of TAB RESERVASI
    for i in range(start_idx, len(lines)):
        if "</div>" in lines[i] and "}" in lines[i+1] and "</div>" in lines[i+3] and "</main>" in lines[i+5]:
            # This is too fragile. Let's find exactly the line.
            pass
            
    # A safer way to find the end: find TAB RESERVASI, then find the NEXT `            )}` at that indentation level.
    for i in range(start_idx, len(lines)):
        if "{/* TAB RESERVASI */}" in lines[i]:
            for j in range(i, len(lines)):
                if "            )}" in lines[j]:
                    end_idx = j
                    break
            break

    print(f"Start index: {start_idx}, End index: {end_idx}")
    
    lines = lines[:start_idx] + [components] + lines[end_idx+1:]
    
    with open(file_path, 'w') as f:
        f.writelines(lines)

if __name__ == '__main__':
    main()
