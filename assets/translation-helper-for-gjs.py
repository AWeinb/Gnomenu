#!/usr/bin/python
'''
    Python script tutorial for glade file localizations.
'''

from subprocess import call
import os
import sys
import shutil
import fileinput


if __name__ == "__main__":
    print "--- Helper for translating a glade file ---"
    print ""

    # Get the glade file.
    while True:
        gladeFile = str(raw_input("Where is the glade file? "))
        if os.path.isfile(gladeFile) and gladeFile.endswith('.glade'):
            break

        yesNoInput = str(raw_input("That\'s not a glade file! Try again? (y/n)> ")).lower()
        if yesNoInput == 'n':
            sys.exit(1)

    # Create the messages. You can use this call in the terminal.
    call(['xgettext', '-L', 'Glade', gladeFile])
    print "Created a messages.po file!"

    # It is neccessary to provide a valid charset.
    charset = str(raw_input("\nWhat is the charset? "))
    for line in fileinput.input('./messages.po', inplace=True):
        if 'Content-Type: text/plain; charset=CHARSET' in line:
            print "\"Content-Type: text/plain; charset=" + charset + "\\n\""
        else:
            print line.strip()
    fileinput.close()

    # The messages.po file is now copied. It would be smart to fill out the static fields before that.
    print "\nYou may now want to fill out the meta fields in the messages.po file before I copy it to the single language files!"
    while True:
        readyStr = str(raw_input("Continue? (y/n)> ")).lower()
        if readyStr == 'y':
            break
        elif readyStr == 'n':
            print "No problem!"
            sys.exit(1)

    # Ask for the language codes for the file names.
    print "\nWhich languages do you want to translate? Press n to skip/stop!"
    langFile = None
    while True:
        langCode = str(raw_input("Code: "))

        if langCode.lower() == 'n':
            break

        if not langFile:
            langFile = open('./LANGUAGES', 'w+')

        langFile.write(langCode + '\n')
        shutil.copy('./messages.po', './' + langCode + '.po')
    langFile.close()

    # Now they need to be filled.
    print "\nNow go into the created files and fill the msgstr field with the correct translation!"
    print "Example: "
    print "msgctxt \"...\""
    print "msgid \"...\""
    print "msgstr \"TRANSLATION\""
    print ""
    print "msgctxt \"...\""
    print "msgid \"...\""
    print "msgstr \"\""
    print "\"TRANSLATION\""
    print "\"TRANSLATION\""

    print "\nAfter that come back!"

    # The files are now ready to get compiled.
    while True:
        readyStr = str(raw_input("Continue? (y/n)> ")).lower()
        if readyStr == 'y':
            break
        elif readyStr == 'n':
            print "No problem!"
            sys.exit(1)

    while not os.path.isfile('./LANGUAGES'):
        print "Did you provide some language ids? There is no LANGUAGES file with the ids!"

        readyStr = str(raw_input("Retry? (y/n)> ")).lower()
        if readyStr == 'n':
            print "No problem!"
            sys.exit(1)

    # Ask for the gettext domain.
    domain = str(raw_input("\nWhat is your preferred gettext domain name? ")).strip()
    if not domain or domain == "":
        domain = 'messages'

    # Lets you use subdirectories.
    specialPathName = str(raw_input("\nDo you want to use a special subdirectory in the locale dir? If yes type a name: ")).strip()
    if specialPathName and len(specialPathName) > 0:
        specialPathName += '/'

    # Compile
    langFile = open('./LANGUAGES')
    for line in langFile:
        line = line.strip()
        path = './locale/' + specialPathName + line + '/LC_MESSAGES/'
        if not os.path.exists(path):
            os.makedirs(path)

        path += domain + '.mo'
        call(['msgfmt', line + '.po', '-o', path])

    print "\nThe compiled files are now in the locale directory."
    print "You need to insert this lines at the beginning of the file:\n"

    print "const Me = imports.misc.extensionUtils.getCurrentExtension();"
    print "const Gettext = imports.gettext;"
    print "Gettext.textdomain(\'" + domain + "\');"
    print "Gettext.bindtextdomain(\'" + domain + "\', Me.path + \"/locale/" + specialPathName + "\");\n"

    print "Now you can use the glade file for the gui:\n"

    print "let builder = new Gtk.Builder();"
    print "builder.add_from_file(GLADE_PATH)"
    print "let element = builder.get_object(\'ELEMENT_NAME\');"
    print "element.show_all();"










